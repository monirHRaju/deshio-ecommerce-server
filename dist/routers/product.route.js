"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const role_middleware_1 = __importDefault(require("../middlewares/role.middleware"));
const router = express_1.default.Router();
router.get('/', product_controller_1.productControllers.getAllProducts);
router.get('/featured', product_controller_1.productControllers.getFeaturedProducts);
router.get('/:id', product_controller_1.productControllers.getProductById);
router.post('/', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), product_controller_1.productControllers.createProduct);
router.patch('/:id', auth_middleware_1.default, product_controller_1.productControllers.updateProduct);
router.delete('/:id', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), product_controller_1.productControllers.deleteProduct);
router.post('/:id/wishlist', auth_middleware_1.default, product_controller_1.productControllers.toggleWishlist);
exports.ProductRoutes = router;
