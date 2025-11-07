import { Router } from 'express';
import {
  getSystemStats,
  getAllUsers,
  getAllConversations,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticateToken, requireRole('admin'), getSystemStats);
router.get('/users', authenticateToken, requireRole('admin'), getAllUsers);
router.get('/conversations', authenticateToken, requireRole('admin'), getAllConversations);
router.get('/faqs', authenticateToken, requireRole('admin'), getFAQs);
router.post('/faqs', authenticateToken, requireRole('admin'), createFAQ);
router.put('/faqs/:faqId', authenticateToken, requireRole('admin'), updateFAQ);
router.delete('/faqs/:faqId', authenticateToken, requireRole('admin'), deleteFAQ);

export default router;
