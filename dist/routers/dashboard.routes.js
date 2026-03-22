"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRoutes = void 0;
const express_1 = __importDefault(require("express"));
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const role_middleware_1 = __importDefault(require("../middlewares/role.middleware"));
const router = express_1.default.Router();
router.use(auth_middleware_1.default, (0, role_middleware_1.default)('admin'));
router.get('/stats', dashboard_controller_1.dashboardControllers.getStats);
router.get('/chart-data', dashboard_controller_1.dashboardControllers.getChartData);
router.get('/recent-orders', dashboard_controller_1.dashboardControllers.getRecentOrders);
exports.DashboardRoutes = router;
