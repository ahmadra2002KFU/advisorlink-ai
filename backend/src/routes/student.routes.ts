import { Router } from 'express';
import {
  getStudentProfile,
  getStudentCourses,
  getStudentAdvisor
} from '../controllers/studentController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticateToken, requireRole('student'), getStudentProfile);
router.get('/courses', authenticateToken, requireRole('student'), getStudentCourses);
router.get('/advisor', authenticateToken, requireRole('student'), getStudentAdvisor);

export default router;
