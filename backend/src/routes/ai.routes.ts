import { Router } from 'express';
import { chatWithAI, getAIChatHistory } from '../controllers/aiController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.post('/chat', authenticateToken, requireRole('student'), chatWithAI);
router.get('/history', authenticateToken, requireRole('student'), getAIChatHistory);

export default router;
