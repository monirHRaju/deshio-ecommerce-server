import { Request, Response } from 'express';
import Product from '../models/product.model';
import Review from '../models/review.model';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import { createNotification } from '../utils/notificationService';
import sendResponse from '../utils/sendResponse';

// Recalculate and update product rating + reviewCount
const updateProductRating = async (productId: string) => {
  const stats = await Review.aggregate([
    { $match: { productId: new (require('mongoose').Types.ObjectId)(productId) } },
    { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
  }
};

// GET /api/v1/reviews  (admin — all reviews with pagination + filters)
const getAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 15);
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};
  if (req.query.rating) filter.rating = Number(req.query.rating);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('userId', 'name avatar')
      .populate('productId', 'title images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reviews retrieved successfully',
    data: reviews,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// POST /api/v1/reviews
const addReview = asyncHandler(async (req: Request, res: Response) => {
  const { productId, rating, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  const existing = await Review.findOne({ userId: req.user!.id, productId });
  if (existing) throw new AppError('You have already reviewed this product', 400);

  const review = await Review.create({ userId: req.user!.id, productId, rating, comment });
  await updateProductRating(productId);

  // Notification: new review submitted
  createNotification({
    type: 'review',
    title: 'New Review Submitted',
    message: `${rating}-star review on "${product.title}"`,
    referenceId: review._id,
    referenceModel: 'Review',
  }).catch(console.error);

  const populated = await review.populate('userId', 'name avatar');

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Review added successfully',
    data: populated,
  });
});

// GET /api/v1/reviews/product/:productId
const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ productId: req.params.productId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ productId: req.params.productId }),
  ]);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reviews retrieved successfully',
    data: reviews,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/v1/reviews/my  — current user's reviews with product info
const getMyReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ userId: req.user!.id })
    .populate('productId', 'title images')
    .sort({ createdAt: -1 });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your reviews retrieved successfully',
    data: reviews,
  });
});

// PATCH /api/v1/reviews/:id
const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  if (String(review.userId) !== req.user!.id) {
    throw new AppError('Not authorized to update this review', 403);
  }

  const { rating, comment } = req.body;
  if (rating) review.rating = rating;
  if (comment) review.comment = comment;
  await review.save();
  await updateProductRating(String(review.productId));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review updated successfully',
    data: review,
  });
});

// DELETE /api/v1/reviews/:id
const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);

  const isOwner = String(review.userId) === req.user!.id;
  const isPrivileged = req.user!.role === 'admin' || req.user!.role === 'super-admin';
  if (!isOwner && !isPrivileged) {
    throw new AppError('Not authorized to delete this review', 403);
  }

  const productId = String(review.productId);
  await review.deleteOne();
  await updateProductRating(productId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review deleted successfully',
  });
});

export const reviewControllers = { getAllReviews, addReview, getProductReviews, getMyReviews, updateReview, deleteReview };
