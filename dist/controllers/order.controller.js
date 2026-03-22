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
exports.orderControllers = void 0;
const cart_model_1 = __importDefault(require("../models/cart.model"));
const coupon_model_1 = __importDefault(require("../models/coupon.model"));
const deliveryZone_model_1 = __importDefault(require("../models/deliveryZone.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
// POST /api/v1/orders  { shippingAddress, paymentMethod, deliveryZoneId?, couponCode?, orderNote? }
const createOrder = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { shippingAddress, paymentMethod = 'card', deliveryZoneId, couponCode, orderNote } = req.body;
    if (!shippingAddress)
        throw new AppError_1.default('Shipping address is required', 400);
    // Require verified email to place orders
    const buyer = yield user_model_1.default.findById(req.user.id);
    if (!(buyer === null || buyer === void 0 ? void 0 : buyer.isVerified)) {
        throw new AppError_1.default('Please verify your email address before placing orders.', 403);
    }
    const cart = yield cart_model_1.default.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0)
        throw new AppError_1.default('Cart is empty', 400);
    // Build order items and update stock
    const orderItems = [];
    for (const item of cart.items) {
        const product = item.productId;
        if (!product)
            throw new AppError_1.default('Product not found in cart', 404);
        if (product.stock < item.quantity) {
            throw new AppError_1.default(`Insufficient stock for ${product.title}`, 400);
        }
        orderItems.push({
            productId: product._id,
            quantity: item.quantity,
            price: item.price,
            title: product.title,
            image: ((_a = product.images) === null || _a === void 0 ? void 0 : _a[0]) || '',
        });
        yield product_model_1.default.findByIdAndUpdate(product._id, {
            $inc: { stock: -item.quantity, sold: item.quantity },
        });
    }
    const itemsTotal = cart.totalAmount;
    // ── Delivery zone ──────────────────────────────────────────────────────────
    let deliveryCharge = 0;
    let resolvedDeliveryZoneId = undefined;
    if (deliveryZoneId) {
        const zone = yield deliveryZone_model_1.default.findById(deliveryZoneId);
        if (!zone || !zone.isActive)
            throw new AppError_1.default('Selected delivery zone is unavailable', 400);
        deliveryCharge = zone.charge;
        resolvedDeliveryZoneId = zone._id;
    }
    // ── Coupon ─────────────────────────────────────────────────────────────────
    let couponDiscount = 0;
    let appliedCouponCode;
    if (couponCode) {
        const coupon = yield coupon_model_1.default.findOne({ code: couponCode.toUpperCase().trim() });
        if (!coupon || !coupon.isActive)
            throw new AppError_1.default('Invalid or inactive coupon code', 400);
        if (coupon.expiresAt && coupon.expiresAt < new Date())
            throw new AppError_1.default('Coupon has expired', 400);
        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
            throw new AppError_1.default('Coupon usage limit reached', 400);
        if (itemsTotal < coupon.minOrderAmount)
            throw new AppError_1.default(`Minimum order amount for this coupon is ${coupon.minOrderAmount}`, 400);
        couponDiscount = coupon.type === 'percent'
            ? Math.min((itemsTotal * coupon.value) / 100, itemsTotal)
            : Math.min(coupon.value, itemsTotal);
        appliedCouponCode = coupon.code;
        // Increment usage count
        yield coupon_model_1.default.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }
    const totalAmount = Math.max(0, itemsTotal + deliveryCharge - couponDiscount);
    const order = yield order_model_1.default.create({
        userId: req.user.id,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentMethod,
        deliveryZoneId: resolvedDeliveryZoneId,
        deliveryCharge,
        couponCode: appliedCouponCode,
        couponDiscount,
        orderNote: orderNote || undefined,
    });
    // Clear cart after order
    yield cart_model_1.default.findOneAndUpdate({ userId: req.user.id }, { items: [], totalAmount: 0 });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Order placed successfully',
        data: order,
    });
}));
// GET /api/v1/orders  (user: own orders | admin: all orders)
const getOrders = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.user.role !== 'admin')
        filter.userId = req.user.id;
    if (req.query.status)
        filter.orderStatus = req.query.status;
    const [orders, total] = yield Promise.all([
        order_model_1.default.find(filter)
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        order_model_1.default.countDocuments(filter),
    ]);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}));
// GET /api/v1/orders/:id
const getOrderById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findById(req.params.id).populate('userId', 'name email');
    if (!order)
        throw new AppError_1.default('Order not found', 404);
    const isOwner = String(order.userId) === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
        throw new AppError_1.default('Not authorized to view this order', 403);
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Order retrieved successfully',
        data: order,
    });
}));
// PATCH /api/v1/orders/:id/status  (admin)
const updateOrderStatus = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderStatus, paymentStatus } = req.body;
    const update = {};
    if (orderStatus)
        update.orderStatus = orderStatus;
    if (paymentStatus)
        update.paymentStatus = paymentStatus;
    const order = yield order_model_1.default.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order)
        throw new AppError_1.default('Order not found', 404);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Order status updated',
        data: order,
    });
}));
// PATCH /api/v1/orders/:id/cancel  (user — pending orders only)
const cancelOrder = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findById(req.params.id);
    if (!order)
        throw new AppError_1.default('Order not found', 404);
    if (String(order.userId) !== req.user.id) {
        throw new AppError_1.default('Not authorized to cancel this order', 403);
    }
    if (order.orderStatus !== 'pending') {
        throw new AppError_1.default('Only pending orders can be cancelled', 400);
    }
    // Restore stock
    for (const item of order.items) {
        yield product_model_1.default.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity, sold: -item.quantity },
        });
    }
    order.orderStatus = 'cancelled';
    yield order.save();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Order cancelled successfully',
        data: order,
    });
}));
// GET /api/v1/orders/track/:orderNumber  (public — no auth, limited info)
const trackOrder = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findOne({ orderNumber: String(req.params.orderNumber).toUpperCase() })
        .populate('deliveryZoneId', 'name charge estimatedDays');
    if (!order)
        throw new AppError_1.default('Order not found. Please check your order number.', 404);
    // Return only tracking-relevant info — omit shippingAddress and userId for privacy
    const tracking = {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        deliveryCharge: order.deliveryCharge,
        couponDiscount: order.couponDiscount,
        orderNote: order.orderNote,
        deliveryZone: order.deliveryZoneId,
        items: order.items.map((i) => ({ title: i.title, quantity: i.quantity, image: i.image, price: i.price })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    };
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Order tracking info retrieved',
        data: tracking,
    });
}));
exports.orderControllers = {
    createOrder,
    getOrders,
    getOrderById,
    trackOrder,
    updateOrderStatus,
    cancelOrder,
};
