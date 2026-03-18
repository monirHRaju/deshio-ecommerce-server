import express from 'express';
import { reviewControllers } from '../controllers/review.controller';
import authenticate from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/product/:productId', reviewControllers.getProductReviews);
router.post('/', authenticate, reviewControllers.addReview);
router.patch('/:id', authenticate, reviewControllers.updateReview);
router.delete('/:id', authenticate, reviewControllers.deleteReview);

export const ReviewRoutes = router;
