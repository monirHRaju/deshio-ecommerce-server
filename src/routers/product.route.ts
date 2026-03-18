import express from 'express';
import { productControllers } from '../controllers/product.controller';
import authenticate from '../middlewares/auth.middleware';
import authorize from '../middlewares/role.middleware';

const router = express.Router();

router.get('/', productControllers.getAllProducts);
router.get('/featured', productControllers.getFeaturedProducts);
router.get('/:id', productControllers.getProductById);
router.post('/', authenticate, authorize('admin'), productControllers.createProduct);
router.patch('/:id', authenticate, productControllers.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), productControllers.deleteProduct);
router.post('/:id/wishlist', authenticate, productControllers.toggleWishlist);

export const ProductRoutes = router;
