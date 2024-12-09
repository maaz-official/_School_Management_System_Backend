import { Poll } from '../models/poll.model.js';
import { Group } from '../models/group.model.js';
import { AppError } from '../utils/appError.js';
import { NotificationService } from '../services/notification.service.js';
import { io } from '../socket.js';

export const pollController = {
  async createPoll(req, res, next) {
    try {
      const { title, description, options, groupId, expiresAt, allowMultipleVotes } = req.body;

      const group = await Group.findById(groupId);
      if (!group) {
        throw new AppError('Group not found', 404);
      }

      const poll = await Poll.create({
        title,
        description,
        options: options.map(opt => ({ text: opt })),
        group: groupId,
        createdBy: req.user.id,
        expiresAt,
        allowMultipleVotes
      });

      // Notify group members
      const notification = {
        title: 'New Poll Created',
        message: `A new poll "${title}" has been created in ${group.name}`,
        type: 'POLL',
        priority: 'MEDIUM'
      };

      await NotificationService.sendBulkNotification(
        group.members.map(member => member.user),
        notification
      );

      // Emit socket event
      io.to(groupId.toString()).emit('newPoll', poll);

      res.status(201).json({
        success: true,
        data: poll
      });
    } catch (error) {
      next(error);
    }
  },

  async vote(req, res, next) {
    try {
      const { pollId, optionId } = req.params;

      const poll = await Poll.findById(pollId);
      if (!poll) {
        throw new AppError('Poll not found', 404);
      }

      if (poll.status !== 'ACTIVE') {
        throw new AppError('Poll is no longer active', 400);
      }

      if (!poll.allowMultipleVotes) {
        // Check if user has already voted
        const hasVoted = poll.options.some(opt => 
          opt.votes.some(vote => vote.user.toString() === req.user.id)
        );

        if (hasVoted) {
          throw new AppError('You have already voted in this poll', 400);
        }
      }

      const option = poll.options.id(optionId);
      if (!option) {
        throw new AppError('Option not found', 404);
      }

      option.votes.push({
        user: req.user.id,
        votedAt: new Date()
      });

      await poll.save();

      // Emit socket event for real-time updates
      io.to(poll.group.toString()).emit('pollVote', {
        pollId,
        optionId,
        userId: req.user.id
      });

      res.json({
        success: true,
        data: poll
      });
    } catch (error) {
      next(error);
    }
  },

  async getPollResults(req, res, next) {
    try {
      const { pollId } = req.params;

      const poll = await Poll.findById(pollId)
        .populate('options.votes.user', 'firstName lastName')
        .populate('createdBy', 'firstName lastName');

      if (!poll) {
        throw new AppError('Poll not found', 404);
      }

      const results = poll.options.map(option => ({
        text: option.text,
        voteCount: option.votes.length,
        percentage: (option.votes.length / poll.options.reduce((sum, opt) => 
          sum + opt.votes.length, 0) * 100).toFixed(2)
      }));

      res.json({
        success: true,
        data: {
          poll,
          results
        }
      });
    } catch (error) {
      next(error);
    }
  }
};