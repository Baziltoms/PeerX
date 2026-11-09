import express from 'express';
import { handleAIChat } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', authenticate, handleAIChat);

export default router;
