import { Request, Response } from 'express';
import Category from '../models/category.model';
import Product from '../models/product.model';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import sendResponse from '../utils/sendResponse';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

// POST /api/v1/categories
const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image, parentCategory } = req.body;
  const slug = slugify(name);

  const existing = await Category.findOne({ slug });
  if (existing) throw new AppError('Category with this name already exists', 400);

  const category = await Category.create({ name, slug, description, image, parentCategory });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

// GET /api/v1/categories/tree  — main categories with children + brands
const getCategoryTree = asyncHandler(async (_req: Request, res: Response) => {
  const all = await Category.find().lean();
  const mains = all.filter((c) => !c.parentCategory);
  const subs = all.filter((c) => c.parentCategory);

  const tree = await Promise.all(
    mains.map(async (main) => {
      const children = subs.filter(
        (s) => s.parentCategory!.toString() === (main._id as any).toString()
      );
      const catIds = [main._id, ...children.map((c) => c._id)];
      const brands: string[] = await Product.distinct('brand', { category: { $in: catIds } });
      return { ...main, children, brands };
    })
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category tree retrieved successfully',
    data: tree,
  });
});

// GET /api/v1/categories
const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().populate('parentCategory', 'name slug');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Categories retrieved successfully',
    data: categories,
  });
});

// GET /api/v1/categories/:id
const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id).populate('parentCategory', 'name slug');
  if (!category) throw new AppError('Category not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category retrieved successfully',
    data: category,
  });
});

// PATCH /api/v1/categories/:id
const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image, parentCategory } = req.body;
  const updateData: Record<string, any> = {};

  if (name) {
    updateData.name = name;
    updateData.slug = slugify(name);
  }
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;
  if (parentCategory !== undefined) updateData.parentCategory = parentCategory;

  const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new AppError('Category not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

// DELETE /api/v1/categories/:id
const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category deleted successfully',
  });
});

export const categoryControllers = {
  getCategoryTree,
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
