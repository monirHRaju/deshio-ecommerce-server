"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    helpful: { type: Number, default: 0 },
}, { timestamps: true });
// One review per user per product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
const Review = (0, mongoose_1.model)('Review', reviewSchema);
exports.default = Review;
