import { Announcement } from '../models/announcement.model.js';
import { Group } from '../models/group.model.js';
import { AppError } from '../utils/appError.js';
import { NotificationService } from '../services/notification.service.js';
import { FileProcessingService } from '../services/fileProcessing.service.js';
import { io } from '../socket.js';

export const announcementController = {
  async createAnnouncement(req, res, next) {
    try {
      const {
        title,
        content,
        groupId,
        priority,
        expiresAt,
        tags
      } = req.body;

      const files = req.files;

      // Process attachments
      const attachments = [];
      if (files && files.length > 0) {
        for (const file of files) {
          await FileProcessingService.scanFile(file.buffer);
          
          if (file.mimetype.startsWith('image/')) {
            const processed = await FileProcessingService.processImage(file);
            attachments.push({
              name: file.originalname,
              url: `/uploads/${processed.hash}`,
              type: processed.mimeType,
              size: processed.size
            });
          } else {
            attachments.push({
              name: file.originalname,
              url: `/uploads/${file.filename}`,
              type: file.mimetype,
              size: file.size
            });
          }
        }
      }

      const announcement = await Announcement.create({
        title,
        content,
        group: groupId,
        author: req.user.id,
        priority,
        attachments,
        expiresAt,
        tags
      });

      // Notify group members
      const group = await Group.findById(groupId).populate('members.user');
      await NotificationService.sendBulkNotification(
        group.members.map(member => member.user._id),
        {
          title: 'New Announcement',
          message: `New announcement: ${title}`,
          type: 'ANNOUNCEMENT',
          priority,
          relatedTo: {
            model: 'Announcement',
            id: announcement._id
          }
        }
      );

      // Real-time notification
      io.to(groupId).emit('newAnnouncement', announcement);

      res.status(201).json({
        success: true,
        data: announcement
      });
    } catch (error) {
      next(error);
    }
  },

  async acknowledgeAnnouncement(req, res, next) {
    try {
      const { announcementId } = req.params;

      const announcement = await Announcement.findByIdAndUpdate(
        announcementId,
        {
          $addToSet: {
            acknowledgments: {
              user: req.user.id
            }
          }
        },
        { new: true }
      );

      if (!announcement) {
        throw new AppError('Announcement not found', 404);
      }

      res.json({
        success: true,
        data: announcement
      });
    } catch (error) {
      next(error);
    }
  },

  async searchAnnouncements(req, res, next) {
    try {
      const {
        groupId,
        searchTerm,
        priority,
        tags,
        startDate,
        endDate,
        page = 1,
        limit = 10
      } = req.query;

      const query = {};

      if (groupId) query.group = groupId;
      if (priority) query.priority = priority;
      if (tags) query.tags = { $in: tags.split(',') };
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      if (searchTerm) {
        query.$text = { $search: searchTerm };
      }

      const announcements = await Announcement.find(query)
        .populate('author', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Announcement.countDocuments(query);

      res.json({
        success: true,
        data: {
          announcements,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
};