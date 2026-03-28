import express from 'express';
import { notificationControllers } from '../controllers/notification.controller';
import authenticate from '../middlewares/auth.middleware';
import authorize from '../middlewares/role.middleware';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/', notificationControllers.getNotifications);
router.get('/unread-count', notificationControllers.getUnreadCount);
router.patch('/read-all', notificationControllers.markAllAsRead);
router.patch('/:id/read', notificationControllers.markAsRead);
router.delete('/:id', notificationControllers.deleteNotification);

export const NotificationRoutes = router;
