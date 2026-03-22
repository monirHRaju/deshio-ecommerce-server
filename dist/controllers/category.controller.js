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
exports.categoryControllers = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const slugify = (text) => text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
// POST /api/v1/categories
const createCategory = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image, parentCategory } = req.body;
    const slug = slugify(name);
    const existing = yield category_model_1.default.findOne({ slug });
    if (existing)
        throw new AppError_1.default('Category with this name already exists', 400);
    const category = yield category_model_1.default.create({ name, slug, description, image, parentCategory });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Category created successfully',
        data: category,
    });
}));
// GET /api/v1/categories/tree  — main categories with children + brands
const getCategoryTree = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const all = yield category_model_1.default.find().lean();
    const mains = all.filter((c) => !c.parentCategory);
    const subs = all.filter((c) => c.parentCategory);
    const tree = yield Promise.all(mains.map((main) => __awaiter(void 0, void 0, void 0, function* () {
        const children = subs.filter((s) => s.parentCategory.toString() === main._id.toString());
        const catIds = [main._id, ...children.map((c) => c._id)];
        const brands = yield product_model_1.default.distinct('brand', { category: { $in: catIds } });
        return Object.assign(Object.assign({}, main), { children, brands });
    })));
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Category tree retrieved successfully',
        data: tree,
    });
}));
// GET /api/v1/categories
const getAllCategories = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield category_model_1.default.find().populate('parentCategory', 'name slug');
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
    });
}));
// GET /api/v1/categories/:id
const getCategoryById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.default.findById(req.params.id).populate('parentCategory', 'name slug');
    if (!category)
        throw new AppError_1.default('Category not found', 404);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Category retrieved successfully',
        data: category,
    });
}));
// PATCH /api/v1/categories/:id
const updateCategory = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image, parentCategory } = req.body;
    const updateData = {};
    if (name) {
        updateData.name = name;
        updateData.slug = slugify(name);
    }
    if (description !== undefined)
        updateData.description = description;
    if (image !== undefined)
        updateData.image = image;
    if (parentCategory !== undefined)
        updateData.parentCategory = parentCategory;
    const category = yield category_model_1.default.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!category)
        throw new AppError_1.default('Category not found', 404);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Category updated successfully',
        data: category,
    });
}));
// DELETE /api/v1/categories/:id
const deleteCategory = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.default.findByIdAndDelete(req.params.id);
    if (!category)
        throw new AppError_1.default('Category not found', 404);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Category deleted successfully',
    });
}));
exports.categoryControllers = {
    getCategoryTree,
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
