"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const role_middleware_1 = __importDefault(require("../middlewares/role.middleware"));
const router = express_1.default.Router();
// Public — guest order tracking (no auth required)
router.get('/track/:orderNumber', order_controller_1.orderControllers.trackOrder);
router.use(auth_middleware_1.default);
router.post('/', order_controller_1.orderControllers.createOrder);
router.get('/', order_controller_1.orderControllers.getOrders);
router.get('/:id', order_controller_1.orderControllers.getOrderById);
router.patch('/:id/status', (0, role_middleware_1.default)('admin'), order_controller_1.orderControllers.updateOrderStatus);
router.patch('/:id/cancel', order_controller_1.orderControllers.cancelOrder);
exports.OrderRoutes = router;
