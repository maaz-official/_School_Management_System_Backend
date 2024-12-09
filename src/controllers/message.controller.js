import { Message } from '../models/message.model.js';
import { Group } from '../models/group.model.js';
import { AppError } from '../utils/appError.js';
import { NotificationService } from '../services/notification.service.js';
import { uploadFile } from '../utils/fileUpload.js';

export const messageController = {
  async sendMessage(req, res, next) {
    try {
      const { recipientId, groupId, content, type, replyTo } = req.body;
      const files = req.files;

      // Handle file uploads if present
      let attachments = [];
      if (files && files.length > 0) {
        attachments = await Promise.all(files.map(file => uploadFile(file)));
      }

      const messageData = {
        sender: req.user.id,
        content,
        type,
        attachments,
        replyTo
      };

      // Set recipient or group
      if (recipientId) {
        messageData.recipient = recipientId;
      } else if (groupId) {
        const group = await Group.findById(groupId);
        if (!group) {
          throw new AppError('Group not found', 404);
        }
        messageData.group = groupId;
      }

      const message = await Message.create(messageData);

      // Send notifications
      if (recipientId) {
        await NotificationService.sendNotification(recipientId, {
          title: 'New Message',
          message: `You have a new message from ${req.user.firstName} ${req.user.lastName}`,
          type: 'MESSAGE',
          priority: 'MEDIUM'
        });
      } else {
        const group = await Group.findById(groupId).populate('members.user');
        await NotificationService.sendBulkNotification(
          group.members.map(member => member.user._id),
          {
            title: 'New Group Message',
            message: `New message in ${group.name} from ${req.user.firstName} ${req.user.lastName}`,
            type: 'MESSAGE',
            priority: 'MEDIUM'
          }
        );
      }

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  },

  async getConversation(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const messages = await Message.find({
        $or: [
          { sender: req.user.id, recipient: userId },
          { sender: userId, recipient: req.user.id }
        ]
      })
      .populate('sender', 'firstName lastName')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  },

  async getGroupMessages(req, res, next) {
    try {
      const { groupId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const messages = await Message.find({ group: groupId })
        .populate('sender', 'firstName lastName')
        .populate('replyTo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const { messageId } = req.params;

      await Message.findByIdAndUpdate(messageId, {
        $push: {
          read: {
            user: req.user.id,
            readAt: new Date()
          }
        }
      });

      res.json({
        success: true,
        message: 'Message marked as read'
      });
    } catch (error) {
      next(error);
    }
  }
};