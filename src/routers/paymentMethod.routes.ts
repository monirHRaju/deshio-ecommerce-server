import express from 'express';
import { paymentMethodControllers } from '../controllers/paymentMethod.controller';
import authenticate from '../middlewares/auth.middleware';
import authorize from '../middlewares/role.middleware';

const router = express.Router();

// Public
router.get('/', paymentMethodControllers.getActivePaymentMethods);

// Admin only
router.use(authenticate, authorize('admin'));
router.get('/all', paymentMethodControllers.getAllPaymentMethods);
router.post('/', paymentMethodControllers.createPaymentMethod);
router.patch('/:id', paymentMethodControllers.updatePaymentMethod);
router.delete('/:id', paymentMethodControllers.deletePaymentMethod);

export const PaymentMethodRoutes = router;
