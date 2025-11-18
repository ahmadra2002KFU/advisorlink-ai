import { Router } from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  markAsRead,
  getUnreadCount,
  getUnreadMessages
} from '../controllers/chatController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticateToken, getConversations);
router.post('/conversations', authenticateToken, requireRole('student'), createConversation);
router.get('/conversations/:conversationId/messages', authenticateToken, getMessages);
router.post('/conversations/:conversationId/messages', authenticateToken, sendMessage);
router.put('/messages/:messageId/read', authenticateToken, markAsRead);
router.get('/unread-count', authenticateToken, getUnreadCount);
router.get('/unread-messages', authenticateToken, getUnreadMessages);

export default router;
