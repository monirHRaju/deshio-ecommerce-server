"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const role_middleware_1 = __importDefault(require("../middlewares/role.middleware"));
const router = express_1.default.Router();
// Authenticated user routes
router.get('/me', auth_middleware_1.default, user_controller_1.userControllers.getProfile);
router.patch('/me', auth_middleware_1.default, user_controller_1.userControllers.updateProfile);
// Admin only routes
router.get('/', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), user_controller_1.userControllers.getAllUsers);
router.post('/', auth_middleware_1.default, (0, role_middleware_1.default)('super-admin'), user_controller_1.userControllers.createAdminUser);
router.get('/:id', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), user_controller_1.userControllers.getUserById);
router.patch('/role', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), user_controller_1.userControllers.updateUserRole);
router.delete('/:id', auth_middleware_1.default, (0, role_middleware_1.default)('admin'), user_controller_1.userControllers.deleteUser);
exports.UserRoutes = router;
