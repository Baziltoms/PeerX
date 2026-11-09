import {
  Announcement,
  Event,
  Notification,
  Conversation,
  Message,
  User,
} from '../models/index.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;
    const query = { institution: institutionId };

    // Filter by targetAudience
    if (req.user.role !== 'admin') {
      query.targetAudience = { $in: ['all', req.user.role] };
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name role avatar')
      .populate('targetDepartment', 'name code')
      .sort({ isPinned: -1, createdAt: -1 });

    return res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;
    const events = await Event.find({ institution: institutionId })
      .populate('organizer', 'name role')
      .sort({ startDate: 1 });

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar role email')
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

export const getMessagesForConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation thread not found.' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, recipientId, content, attachmentUrl } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    let activeConversationId = conversationId;

    if (!activeConversationId && recipientId) {
      // Find or create direct conversation
      let conv = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientId], $size: 2 },
        type: 'direct',
      });

      if (!conv) {
        conv = await Conversation.create({
          institution: req.user.institution,
          participants: [req.user._id, recipientId],
          type: 'direct',
        });
      }
      activeConversationId = conv._id;
    }

    const message = await Message.create({
      conversation: activeConversationId,
      sender: req.user._id,
      content,
      attachmentUrl: attachmentUrl || '',
      isReadBy: [req.user._id],
    });

    await Conversation.findByIdAndUpdate(activeConversationId, {
      lastMessage: content,
      lastMessageAt: new Date(),
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatar role');

    return res.status(201).json({
      success: true,
      message: 'Message sent.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
