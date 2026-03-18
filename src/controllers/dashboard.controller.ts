import { Request, Response } from 'express';
import Order from '../models/order.model';
import Product from '../models/product.model';
import Review from '../models/review.model';
import User from '../models/user.model';
import asyncHandler from '../utils/asyncHandler';
import sendResponse from '../utils/sendResponse';

// GET /api/v1/dashboard/stats
const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalProducts, totalOrders, revenueResult] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  const totalRevenue = revenueResult[0]?.total ?? 0;

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashboard stats retrieved',
    data: { totalUsers, totalProducts, totalOrders, totalRevenue },
  });
});

// GET /api/v1/dashboard/chart-data
const getChartData = asyncHandler(async (_req: Request, res: Response) => {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // Monthly orders & revenue (last 12 months)
  const monthlyData = await Order.aggregate([
    { $match: { createdAt: { $gte: twelveMonthsAgo }, orderStatus: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Order status distribution (pie chart)
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  // Top 5 selling products
  const topProducts = await Product.find()
    .sort({ sold: -1 })
    .limit(5)
    .select('title sold rating images');

  // Top 5 categories by product count
  const topCategories = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $project: { name: '$category.name', count: 1 } },
  ]);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chart data retrieved',
    data: { monthlyData, ordersByStatus, topProducts, topCategories },
  });
});

// GET /api/v1/dashboard/recent-orders
const getRecentOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await Order.find()
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recent orders retrieved',
    data: orders,
  });
});

export const dashboardControllers = { getStats, getChartData, getRecentOrders };
