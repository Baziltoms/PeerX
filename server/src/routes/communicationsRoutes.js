import express from 'express';
import {
  getAnnouncements,
  getEvents,
  getNotifications,
  markNotificationRead,
  getConversations,
  getMessagesForConversation,
  sendMessage,
} from '../controllers/communicationsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/announcements', getAnnouncements);
router.get('/events', getEvents);
router.get('/notifications', getNotifications);
router.patch('/notifications/:notificationId/read', markNotificationRead);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessagesForConversation);
router.post('/messages', sendMessage);

export default router;
