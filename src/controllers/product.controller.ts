import { Request, Response } from 'express';
import Product from '../models/product.model';
import User from '../models/user.model';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import sendResponse from '../utils/sendResponse';

// POST /api/v1/products
const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const productData = { ...req.body, createdBy: req.user!.id };
  const product = await Product.create(productData);
  const populated = await product.populate('category', 'name slug');

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Product created successfully',
    data: populated,
  });
});

// GET /api/v1/products
const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  // Search — regex for partial/substring matching (case-insensitive)
  if (req.query.search) {
    const regex = { $regex: req.query.search as string, $options: 'i' };
    filter.$or = [{ title: regex }, { description: regex }, { brand: regex }, { tags: regex }];
  }

  // Filters
  if (req.query.category) filter.category = req.query.category;
  if (req.query.brand) filter.brand = { $regex: req.query.brand, $options: 'i' };
  if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured === 'true';
  if (req.query.priceMin || req.query.priceMax) {
    filter.price = {};
    if (req.query.priceMin) filter.price.$gte = Number(req.query.priceMin);
    if (req.query.priceMax) filter.price.$lte = Number(req.query.priceMax);
  }
  if (req.query.rating) filter.rating = { $gte: Number(req.query.rating) };

  // Sorting
  let sortOption: Record<string, any> = { createdAt: -1 };
  if (req.query.sort) {
    const sortStr = req.query.sort as string;
    if (sortStr === 'price') sortOption = { price: 1 };
    else if (sortStr === '-price') sortOption = { price: -1 };
    else if (sortStr === 'rating') sortOption = { rating: -1 };
    else if (sortStr === '-createdAt') sortOption = { createdAt: -1 };
    else if (sortStr === 'createdAt') sortOption = { createdAt: 1 };
    else if (sortStr === '-sold') sortOption = { sold: -1 };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .populate('createdBy', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products retrieved successfully',
    data: products,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/v1/products/featured
const getFeaturedProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find({ isFeatured: true })
    .populate('category', 'name slug')
    .sort({ rating: -1 })
    .limit(8);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Featured products retrieved successfully',
    data: products,
  });
});

// GET /api/v1/products/:id
const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('createdBy', 'name avatar');
  if (!product) throw new AppError('Product not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product retrieved successfully',
    data: product,
  });
});

// PATCH /api/v1/products/:id
const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  // Only admin or product owner can update
  const isOwner = String(product.createdBy) === req.user!.id;
  if (!isOwner && req.user!.role !== 'admin') {
    throw new AppError('Not authorized to update this product', 403);
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product updated successfully',
    data: updated,
  });
});

// DELETE /api/v1/products/:id
const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product deleted successfully',
  });
});

// POST /api/v1/products/:id/wishlist  (toggle)
const toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);

  const wishlist = user.wishlist ?? [];
  const index = wishlist.findIndex((id) => String(id) === productId);

  let message: string;
  if (index > -1) {
    wishlist.splice(index, 1);
    message = 'Removed from wishlist';
  } else {
    wishlist.push(product._id!);
    message = 'Added to wishlist';
  }
  user.wishlist = wishlist;
  await user.save();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message,
    data: { wishlist: user.wishlist },
  });
});

export const productControllers = {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleWishlist,
};
