import express from 'express';
import { deliveryZoneControllers } from '../controllers/deliveryZone.controller';
import authenticate from '../middlewares/auth.middleware';
import authorize from '../middlewares/role.middleware';

const router = express.Router();

// Public — customers fetch zones at checkout
router.get('/', deliveryZoneControllers.getDeliveryZones);

// Admin only
router.post('/', authenticate, authorize('admin'), deliveryZoneControllers.createDeliveryZone);
router.patch('/:id', authenticate, authorize('admin'), deliveryZoneControllers.updateDeliveryZone);
router.delete('/:id', authenticate, authorize('admin'), deliveryZoneControllers.deleteDeliveryZone);

export const DeliveryZoneRoutes = router;
