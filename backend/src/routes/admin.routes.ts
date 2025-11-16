import { Router } from 'express';
import {
  getSystemStats,
  getAllUsers,
  getAllConversations,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
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

// Student CRUD routes
router.get('/students', authenticateToken, requireRole('admin'), getAllStudents);
router.get('/students/:studentId', authenticateToken, requireRole('admin'), getStudent);
router.post('/students', authenticateToken, requireRole('admin'), createStudent);
router.put('/students/:studentId', authenticateToken, requireRole('admin'), updateStudent);
router.delete('/students/:studentId', authenticateToken, requireRole('admin'), deleteStudent);

export default router;
