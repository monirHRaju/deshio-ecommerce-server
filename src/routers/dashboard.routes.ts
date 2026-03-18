import express from 'express';
import { dashboardControllers } from '../controllers/dashboard.controller';
import authenticate from '../middlewares/auth.middleware';
import authorize from '../middlewares/role.middleware';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', dashboardControllers.getStats);
router.get('/chart-data', dashboardControllers.getChartData);
router.get('/recent-orders', dashboardControllers.getRecentOrders);

export const DashboardRoutes = router;
