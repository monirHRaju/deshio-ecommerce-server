import express from 'express';
import { orderControllers } from '../controllers/order.controller';
import authenticate from '../middlewares/auth.middleware';
import authorize from '../middlewares/role.middleware';

const router = express.Router();

// Public — guest order tracking (no auth required)
router.get('/track/:orderNumber', orderControllers.trackOrder);

router.use(authenticate);

router.post('/', orderControllers.createOrder);
router.get('/', orderControllers.getOrders);
router.get('/:id', orderControllers.getOrderById);
router.patch('/:id/status', authorize('admin'), orderControllers.updateOrderStatus);
router.patch('/:id/cancel', orderControllers.cancelOrder);

export const OrderRoutes = router;
