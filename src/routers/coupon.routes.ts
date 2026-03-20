import express from 'express';
import { couponControllers } from '../controllers/coupon.controller';
import authenticate from '../middlewares/auth.middleware';
import authorize from '../middlewares/role.middleware';

const router = express.Router();

// Public — validate a coupon code before checkout
router.post('/validate', couponControllers.validateCoupon);

// Admin only
router.get('/', authenticate, authorize('admin'), couponControllers.getCoupons);
router.post('/', authenticate, authorize('admin'), couponControllers.createCoupon);
router.delete('/:id', authenticate, authorize('admin'), couponControllers.deleteCoupon);

export const CouponRoutes = router;
