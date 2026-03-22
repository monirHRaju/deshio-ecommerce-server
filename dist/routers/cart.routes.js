"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRoutes = void 0;
const express_1 = __importDefault(require("express"));
const cart_controller_1 = require("../controllers/cart.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = express_1.default.Router();
// All cart routes require authentication
router.use(auth_middleware_1.default);
router.get('/', cart_controller_1.cartControllers.getCart);
router.post('/', cart_controller_1.cartControllers.addToCart);
router.patch('/:itemId', cart_controller_1.cartControllers.updateCartItem);
router.delete('/:itemId', cart_controller_1.cartControllers.removeCartItem);
router.delete('/', cart_controller_1.cartControllers.clearCart);
exports.CartRoutes = router;
