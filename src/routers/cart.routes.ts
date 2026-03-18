import express from 'express';
import { cartControllers } from '../controllers/cart.controller';
import authenticate from '../middlewares/auth.middleware';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartControllers.getCart);
router.post('/', cartControllers.addToCart);
router.patch('/:itemId', cartControllers.updateCartItem);
router.delete('/:itemId', cartControllers.removeCartItem);
router.delete('/', cartControllers.clearCart);

export const CartRoutes = router;
