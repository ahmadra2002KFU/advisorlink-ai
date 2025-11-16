import { Router } from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  markAsRead,
  getUnreadCount
} from '../controllers/chatController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticateToken, getConversations);
router.post('/conversations', authenticateToken, requireRole('student'), createConversation);
router.get('/conversations/:conversationId/messages', authenticateToken, getMessages);
router.post('/conversations/:conversationId/messages', authenticateToken, sendMessage);
router.put('/messages/:messageId/read', authenticateToken, markAsRead);
router.get('/unread-count', authenticateToken, getUnreadCount);

export default router;
