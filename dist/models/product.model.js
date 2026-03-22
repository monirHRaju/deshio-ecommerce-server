"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, trim: true },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String, lowercase: true, trim: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0 },
    sold: { type: Number, default: 0 },
    specifications: { type: Map, of: String },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
// Text index for search
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
const Product = (0, mongoose_1.model)('Product', productSchema);
exports.default = Product;
