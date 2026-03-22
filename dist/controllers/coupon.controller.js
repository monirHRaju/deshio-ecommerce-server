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
exports.couponControllers = void 0;
const coupon_model_1 = __importDefault(require("../models/coupon.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
// POST /api/v1/coupons/validate  (public)
const validateCoupon = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, orderTotal } = req.body;
    if (!code)
        throw new AppError_1.default('Coupon code is required', 400);
    const coupon = yield coupon_model_1.default.findOne({ code: code.toUpperCase().trim() });
    if (!coupon || !coupon.isActive)
        throw new AppError_1.default('Invalid or inactive coupon code', 400);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new AppError_1.default('This coupon has expired', 400);
    }
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
        throw new AppError_1.default('This coupon has reached its usage limit', 400);
    }
    const total = Number(orderTotal) || 0;
    if (total < coupon.minOrderAmount) {
        throw new AppError_1.default(`Minimum order amount for this coupon is ${coupon.minOrderAmount}`, 400);
    }
    const discount = coupon.type === 'percent'
        ? Math.min((total * coupon.value) / 100, total)
        : Math.min(coupon.value, total);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Coupon applied! You save ${discount.toFixed(2)}`,
        data: {
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
            discount: parseFloat(discount.toFixed(2)),
        },
    });
}));
// GET /api/v1/coupons  (admin)
const getCoupons = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const coupons = yield coupon_model_1.default.find().sort({ createdAt: -1 });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Coupons retrieved successfully',
        data: coupons,
    });
}));
// POST /api/v1/coupons  (admin)
const createCoupon = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { code, description, type, value, minOrderAmount, maxUses, expiresAt } = req.body;
    const existing = yield coupon_model_1.default.findOne({ code: (_a = code === null || code === void 0 ? void 0 : code.toUpperCase()) === null || _a === void 0 ? void 0 : _a.trim() });
    if (existing)
        throw new AppError_1.default('Coupon code already exists', 400);
    const coupon = yield coupon_model_1.default.create({
        code,
        description,
        type,
        value,
        minOrderAmount: minOrderAmount !== null && minOrderAmount !== void 0 ? minOrderAmount : 0,
        maxUses: maxUses !== null && maxUses !== void 0 ? maxUses : 0,
        expiresAt: expiresAt || undefined,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
    });
}));
// DELETE /api/v1/coupons/:id  (admin)
const deleteCoupon = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield coupon_model_1.default.findByIdAndDelete(req.params.id);
    if (!coupon)
        throw new AppError_1.default('Coupon not found', 404);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Coupon deleted successfully',
    });
}));
exports.couponControllers = { validateCoupon, getCoupons, createCoupon, deleteCoupon };
