import express from 'express';
import { chatWithAI } from '../controllers/aiController.mjs';

const router = express.Router();

router.post('/chat', chatWithAI);

export default router;