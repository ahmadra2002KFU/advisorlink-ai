import { Router } from 'express';
import { chatWithAI, getAIChatHistory } from '../controllers/aiController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.post('/chat', authenticateToken, requireRole('student', 'advisor'), chatWithAI);
router.get('/history', authenticateToken, requireRole('student', 'advisor'), getAIChatHistory);

export default router;
