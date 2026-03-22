"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryZoneRoutes = void 0;
const express_1 = __importDefault(require("express"));
const deliveryZone_controller_1 = require("../controllers/deliveryZone.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const role_middleware_1 = __importDefault(require("../middlewares/role.middleware"));
const router = express_1.default.Router();
// Public — customers fetch zones at checkout
router.get('/', deliveryZone_controller_1.deliveryZoneControllers.getDeliveryZones);
// Admin only
router.post('/', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), deliveryZone_controller_1.deliveryZoneControllers.createDeliveryZone);
router.patch('/:id', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), deliveryZone_controller_1.deliveryZoneControllers.updateDeliveryZone);
router.delete('/:id', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), deliveryZone_controller_1.deliveryZoneControllers.deleteDeliveryZone);
exports.DeliveryZoneRoutes = router;
