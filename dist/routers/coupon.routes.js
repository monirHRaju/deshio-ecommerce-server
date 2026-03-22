"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponRoutes = void 0;
const express_1 = __importDefault(require("express"));
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const role_middleware_1 = __importDefault(require("../middlewares/role.middleware"));
const router = express_1.default.Router();
// Public — validate a coupon code before checkout
router.post('/validate', coupon_controller_1.couponControllers.validateCoupon);
// Admin only
router.get('/', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), coupon_controller_1.couponControllers.getCoupons);
router.post('/', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), coupon_controller_1.couponControllers.createCoupon);
router.delete('/:id', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), coupon_controller_1.couponControllers.deleteCoupon);
exports.CouponRoutes = router;
