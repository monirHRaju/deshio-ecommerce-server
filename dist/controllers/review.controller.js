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
exports.reviewControllers = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const review_model_1 = __importDefault(require("../models/review.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
// Recalculate and update product rating + reviewCount
const updateProductRating = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield review_model_1.default.aggregate([
        { $match: { productId: new (require('mongoose').Types.ObjectId)(productId) } },
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
        yield product_model_1.default.findByIdAndUpdate(productId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count,
        });
    }
    else {
        yield product_model_1.default.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
    }
});
// POST /api/v1/reviews
const addReview = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, rating, comment } = req.body;
    const product = yield product_model_1.default.findById(productId);
    if (!product)
        throw new AppError_1.default('Product not found', 404);
    const existing = yield review_model_1.default.findOne({ userId: req.user.id, productId });
    if (existing)
        throw new AppError_1.default('You have already reviewed this product', 400);
    const review = yield review_model_1.default.create({ userId: req.user.id, productId, rating, comment });
    yield updateProductRating(productId);
    const populated = yield review.populate('userId', 'name avatar');
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Review added successfully',
        data: populated,
    });
}));
// GET /api/v1/reviews/product/:productId
const getProductReviews = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const [reviews, total] = yield Promise.all([
        review_model_1.default.find({ productId: req.params.productId })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        review_model_1.default.countDocuments({ productId: req.params.productId }),
    ]);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Reviews retrieved successfully',
        data: reviews,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}));
// GET /api/v1/reviews/my  — current user's reviews with product info
const getMyReviews = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield review_model_1.default.find({ userId: req.user.id })
        .populate('productId', 'title images')
        .sort({ createdAt: -1 });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Your reviews retrieved successfully',
        data: reviews,
    });
}));
// PATCH /api/v1/reviews/:id
const updateReview = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield review_model_1.default.findById(req.params.id);
    if (!review)
        throw new AppError_1.default('Review not found', 404);
    if (String(review.userId) !== req.user.id) {
        throw new AppError_1.default('Not authorized to update this review', 403);
    }
    const { rating, comment } = req.body;
    if (rating)
        review.rating = rating;
    if (comment)
        review.comment = comment;
    yield review.save();
    yield updateProductRating(String(review.productId));
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Review updated successfully',
        data: review,
    });
}));
// DELETE /api/v1/reviews/:id
const deleteReview = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield review_model_1.default.findById(req.params.id);
    if (!review)
        throw new AppError_1.default('Review not found', 404);
    const isOwner = String(review.userId) === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
        throw new AppError_1.default('Not authorized to delete this review', 403);
    }
    const productId = String(review.productId);
    yield review.deleteOne();
    yield updateProductRating(productId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Review deleted successfully',
    });
}));
exports.reviewControllers = { addReview, getProductReviews, getMyReviews, updateReview, deleteReview };
