"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardControllers = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
// GET /api/v1/dashboard/stats
const getStats = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const [totalUsers, totalProducts, totalOrders, revenueResult] = yield Promise.all([
        user_model_1.default.countDocuments(),
        product_model_1.default.countDocuments(),
        order_model_1.default.countDocuments(),
        order_model_1.default.aggregate([
            { $match: { orderStatus: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
    ]);
    const totalRevenue = (_b = (_a = revenueResult[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0;
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Dashboard stats retrieved',
        data: { totalUsers, totalProducts, totalOrders, totalRevenue },
    });
}));
// GET /api/v1/dashboard/chart-data
const getChartData = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    // Monthly orders & revenue (last 12 months)
    const monthlyData = yield order_model_1.default.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo }, orderStatus: { $ne: 'cancelled' } } },
        {
            $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                orders: { $sum: 1 },
                revenue: { $sum: '$totalAmount' },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    // Order status distribution (pie chart)
    const ordersByStatus = yield order_model_1.default.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);
    // Top 5 selling products
    const topProducts = yield product_model_1.default.find()
        .sort({ sold: -1 })
        .limit(5)
        .select('title sold rating images');
    // Top 5 categories by product count
    const topCategories = yield product_model_1.default.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category',
            },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$category.name', count: 1 } },
    ]);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Chart data retrieved',
        data: { monthlyData, ordersByStatus, topProducts, topCategories },
    });
}));
// GET /api/v1/dashboard/recent-orders
const getRecentOrders = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.default.find()
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(10);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Recent orders retrieved',
        data: orders,
    });
}));
exports.dashboardControllers = { getStats, getChartData, getRecentOrders };
