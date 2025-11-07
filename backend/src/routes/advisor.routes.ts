import { Router } from 'express';
import {
  getAdvisorProfile,
  getAssignedStudents,
  updateAvailability,
  getAdvisorStats
} from '../controllers/advisorController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticateToken, requireRole('advisor'), getAdvisorProfile);
router.get('/students', authenticateToken, requireRole('advisor'), getAssignedStudents);
router.get('/stats', authenticateToken, requireRole('advisor'), getAdvisorStats);
router.put('/availability', authenticateToken, requireRole('advisor'), updateAvailability);

export default router;
