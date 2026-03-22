"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const role_middleware_1 = __importDefault(require("../middlewares/role.middleware"));
const router = express_1.default.Router();
router.get('/tree', category_controller_1.categoryControllers.getCategoryTree);
router.get('/', category_controller_1.categoryControllers.getAllCategories);
router.get('/:id', category_controller_1.categoryControllers.getCategoryById);
router.post('/', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), category_controller_1.categoryControllers.createCategory);
router.patch('/:id', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), category_controller_1.categoryControllers.updateCategory);
router.delete('/:id', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), category_controller_1.categoryControllers.deleteCategory);
exports.CategoryRoutes = router;
