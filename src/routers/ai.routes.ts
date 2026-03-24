import express from 'express';
import { aiControllers } from '../controllers/ai.controller';
import authenticate from '../middlewares/auth.middleware';

const router = express.Router();

// Public (no auth required)
router.post('/summarize-reviews', aiControllers.summarizeReviews);
router.post('/chat', aiControllers.chatWithAssistant);

// Protected
router.use(authenticate);
router.post('/generate-description', aiControllers.generateProductDescription);
router.post('/generate-tags', aiControllers.generateProductTags);
router.post('/smart-search', aiControllers.smartSearch);

export const AiRoutes = router;
