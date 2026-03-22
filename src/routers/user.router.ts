import express from 'express';
import { userControllers } from '../controllers/user.controller';
import authenticate from '../middlewares/auth.middleware';
import authorize from '../middlewares/role.middleware';

const router = express.Router();

// Authenticated user routes
router.get('/me', authenticate, userControllers.getProfile);
router.patch('/me', authenticate, userControllers.updateProfile);

// Admin only routes
router.get('/', authenticate, authorize('admin'), userControllers.getAllUsers);
router.post('/', authenticate, authorize('super-admin'), userControllers.createAdminUser);
router.get('/:id', authenticate, authorize('admin'), userControllers.getUserById);
router.patch('/role', authenticate, authorize('admin'), userControllers.updateUserRole);
router.delete('/:id', authenticate, authorize('admin'), userControllers.deleteUser);

export const UserRoutes = router;
