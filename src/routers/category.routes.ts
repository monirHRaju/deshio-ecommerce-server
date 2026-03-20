import express from 'express';
import { categoryControllers } from '../controllers/category.controller';
import authenticate from '../middlewares/auth.middleware';
import authorize from '../middlewares/role.middleware';

const router = express.Router();

router.get('/tree', categoryControllers.getCategoryTree);
router.get('/', categoryControllers.getAllCategories);
router.get('/:id', categoryControllers.getCategoryById);
router.post('/', authenticate, authorize('admin'), categoryControllers.createCategory);
router.patch('/:id', authenticate, authorize('admin'), categoryControllers.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), categoryControllers.deleteCategory);

export const CategoryRoutes = router;
