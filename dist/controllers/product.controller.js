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
exports.productControllers = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
// POST /api/v1/products
const createProduct = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productData = Object.assign(Object.assign({}, req.body), { createdBy: req.user.id });
    const product = yield product_model_1.default.create(productData);
    const populated = yield product.populate('category', 'name slug');
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Product created successfully',
        data: populated,
    });
}));
// GET /api/v1/products
const getAllProducts = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const filter = {};
    // Search — regex for partial/substring matching (case-insensitive)
    if (req.query.search) {
        const regex = { $regex: req.query.search, $options: 'i' };
        filter.$or = [{ title: regex }, { description: regex }, { brand: regex }, { tags: regex }];
    }
    // Filters
    if (req.query.category)
        filter.category = req.query.category;
    if (req.query.brand)
        filter.brand = { $regex: req.query.brand, $options: 'i' };
    if (req.query.isFeatured)
        filter.isFeatured = req.query.isFeatured === 'true';
    if (req.query.priceMin || req.query.priceMax) {
        filter.price = {};
        if (req.query.priceMin)
            filter.price.$gte = Number(req.query.priceMin);
        if (req.query.priceMax)
            filter.price.$lte = Number(req.query.priceMax);
    }
    if (req.query.rating)
        filter.rating = { $gte: Number(req.query.rating) };
    // Sorting
    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
        const sortStr = req.query.sort;
        if (sortStr === 'price')
            sortOption = { price: 1 };
        else if (sortStr === '-price')
            sortOption = { price: -1 };
        else if (sortStr === 'rating')
            sortOption = { rating: -1 };
        else if (sortStr === '-createdAt')
            sortOption = { createdAt: -1 };
        else if (sortStr === 'createdAt')
            sortOption = { createdAt: 1 };
        else if (sortStr === '-sold')
            sortOption = { sold: -1 };
    }
    const [products, total] = yield Promise.all([
        product_model_1.default.find(filter)
            .populate('category', 'name slug')
            .populate('createdBy', 'name')
            .sort(sortOption)
            .skip(skip)
            .limit(limit),
        product_model_1.default.countDocuments(filter),
    ]);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Products retrieved successfully',
        data: products,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}));
// GET /api/v1/products/featured
const getFeaturedProducts = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_model_1.default.find({ isFeatured: true })
        .populate('category', 'name slug')
        .sort({ rating: -1 })
        .limit(8);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Featured products retrieved successfully',
        data: products,
    });
}));
// GET /api/v1/products/:id
const getProductById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.default.findById(req.params.id)
        .populate('category', 'name slug')
        .populate('createdBy', 'name avatar');
    if (!product)
        throw new AppError_1.default('Product not found', 404);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Product retrieved successfully',
        data: product,
    });
}));
// PATCH /api/v1/products/:id
const updateProduct = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.default.findById(req.params.id);
    if (!product)
        throw new AppError_1.default('Product not found', 404);
    // Only admin or product owner can update
    const isOwner = String(product.createdBy) === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
        throw new AppError_1.default('Not authorized to update this product', 403);
    }
    const updated = yield product_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate('category', 'name slug');
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Product updated successfully',
        data: updated,
    });
}));
// DELETE /api/v1/products/:id
const deleteProduct = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.default.findByIdAndDelete(req.params.id);
    if (!product)
        throw new AppError_1.default('Product not found', 404);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Product deleted successfully',
    });
}));
// POST /api/v1/products/:id/wishlist  (toggle)
const toggleWishlist = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const productId = req.params.id;
    const product = yield product_model_1.default.findById(productId);
    if (!product)
        throw new AppError_1.default('Product not found', 404);
    const user = yield user_model_1.default.findById(req.user.id);
    if (!user)
        throw new AppError_1.default('User not found', 404);
    const wishlist = (_a = user.wishlist) !== null && _a !== void 0 ? _a : [];
    const index = wishlist.findIndex((id) => String(id) === productId);
    let message;
    if (index > -1) {
        wishlist.splice(index, 1);
        message = 'Removed from wishlist';
    }
    else {
        wishlist.push(product._id);
        message = 'Added to wishlist';
    }
    user.wishlist = wishlist;
    yield user.save();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message,
        data: { wishlist: user.wishlist },
    });
}));
exports.productControllers = {
    createProduct,
    getAllProducts,
    getFeaturedProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleWishlist,
};
