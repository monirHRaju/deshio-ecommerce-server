import express from 'express';
import { AiRoutes } from './ai.routes';
import { AuthRoutes } from './auth.routes';
import { CartRoutes } from './cart.routes';
import { CategoryRoutes } from './category.routes';
import { CouponRoutes } from './coupon.routes';
import { DashboardRoutes } from './dashboard.routes';
import { NotificationRoutes } from './notification.routes';
import { DeliveryZoneRoutes } from './deliveryZone.routes';
import { OrderRoutes } from './order.routes';
import { ProductRoutes } from './product.route';
import { ReviewRoutes } from './review.routes';
import { PaymentMethodRoutes } from './paymentMethod.routes';
import { UserRoutes } from './user.router';

const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/categories', route: CategoryRoutes },
  { path: '/products', route: ProductRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/cart', route: CartRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/coupons', route: CouponRoutes },
  { path: '/delivery-zones', route: DeliveryZoneRoutes },
  { path: '/payment-methods', route: PaymentMethodRoutes },
  { path: '/dashboard', route: DashboardRoutes },
  { path: '/notifications', route: NotificationRoutes },
  { path: '/ai', route: AiRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
