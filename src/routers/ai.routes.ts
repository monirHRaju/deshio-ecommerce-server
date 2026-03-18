import express from 'express';
import { aiControllers } from '../controllers/ai.controller';
import authenticate from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.post('/generate-description', aiControllers.generateProductDescription);
router.post('/generate-tags', aiControllers.generateProductTags);
router.post('/smart-search', aiControllers.smartSearch);

export const AiRoutes = router;
