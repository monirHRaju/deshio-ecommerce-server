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
exports.cartControllers = void 0;
const cart_model_1 = __importDefault(require("../models/cart.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const calcTotal = (items) => items.reduce((sum, item) => sum + item.quantity * item.price, 0);
// GET /api/v1/cart
const getCart = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield cart_model_1.default.findOne({ userId: req.user.id }).populate('items.productId', 'title images price stock brand');
    if (!cart) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: 'Cart is empty',
            data: { items: [], totalAmount: 0 },
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Cart retrieved successfully',
        data: cart,
    });
}));
// POST /api/v1/cart  { productId, quantity }
const addToCart = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, quantity = 1 } = req.body;
    const product = yield product_model_1.default.findById(productId);
    if (!product)
        throw new AppError_1.default('Product not found', 404);
    if (product.stock < quantity)
        throw new AppError_1.default('Insufficient stock', 400);
    let cart = yield cart_model_1.default.findOne({ userId: req.user.id });
    if (!cart) {
        cart = yield cart_model_1.default.create({
            userId: req.user.id,
            items: [{ productId, quantity, price: product.price }],
            totalAmount: product.price * quantity,
        });
    }
    else {
        const existingIndex = cart.items.findIndex((item) => String(item.productId) === String(productId));
        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += quantity;
        }
        else {
            cart.items.push({ productId, quantity, price: product.price });
        }
        cart.totalAmount = calcTotal(cart.items);
        yield cart.save();
    }
    yield cart.populate('items.productId', 'title images price stock brand');
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Item added to cart',
        data: cart,
    });
}));
// PATCH /api/v1/cart/:itemId  { quantity }
const updateCartItem = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { quantity } = req.body;
    if (!quantity || quantity < 1)
        throw new AppError_1.default('Quantity must be at least 1', 400);
    const cart = yield cart_model_1.default.findOne({ userId: req.user.id });
    if (!cart)
        throw new AppError_1.default('Cart not found', 404);
    const item = cart.items.find((i) => String(i._id) === req.params.itemId);
    if (!item)
        throw new AppError_1.default('Cart item not found', 404);
    const product = yield product_model_1.default.findById(item.productId);
    if (product && product.stock < quantity)
        throw new AppError_1.default('Insufficient stock', 400);
    item.quantity = quantity;
    cart.totalAmount = calcTotal(cart.items);
    yield cart.save();
    yield cart.populate('items.productId', 'title images price stock brand');
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Cart updated',
        data: cart,
    });
}));
// DELETE /api/v1/cart/:itemId
const removeCartItem = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield cart_model_1.default.findOne({ userId: req.user.id });
    if (!cart)
        throw new AppError_1.default('Cart not found', 404);
    const initialLength = cart.items.length;
    cart.items = cart.items.filter((i) => String(i._id) !== req.params.itemId);
    if (cart.items.length === initialLength)
        throw new AppError_1.default('Cart item not found', 404);
    cart.totalAmount = calcTotal(cart.items);
    yield cart.save();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Item removed from cart',
        data: cart,
    });
}));
// DELETE /api/v1/cart
const clearCart = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield cart_model_1.default.findOneAndUpdate({ userId: req.user.id }, { items: [], totalAmount: 0 });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Cart cleared',
    });
}));
exports.cartControllers = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
