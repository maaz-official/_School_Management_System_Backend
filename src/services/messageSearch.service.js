import { Message } from '../models/message.model.js';

export class MessageSearchService {
  static async searchMessages(query) {
    const {
      userId,
      groupId,
      searchTerm,
      startDate,
      endDate,
      type,
      hasAttachments,
      page = 1,
      limit = 20
    } = query;

    const searchQuery = {};

    if (userId) {
      searchQuery.$or = [
        { sender: userId },
        { recipient: userId }
      ];
    }

    if (groupId) {
      searchQuery.group = groupId;
    }

    if (searchTerm) {
      searchQuery.content = { $regex: searchTerm, $options: 'i' };
    }

    if (startDate || endDate) {
      searchQuery.createdAt = {};
      if (startDate) searchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) searchQuery.createdAt.$lte = new Date(endDate);
    }

    if (type) {
      searchQuery.type = type;
    }

    if (hasAttachments !== undefined) {
      if (hasAttachments) {
        searchQuery['attachments.0'] = { $exists: true };
      } else {
        searchQuery.attachments = { $size: 0 };
      }
    }

    const messages = await Message.find(searchQuery)
      .populate('sender', 'firstName lastName')
      .populate('recipient', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Message.countDocuments(searchQuery);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}