"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String, default: 'https://placehold.co/400x300' },
    parentCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category' },
}, { timestamps: true });
const Category = (0, mongoose_1.model)('Category', categorySchema);
exports.default = Category;
