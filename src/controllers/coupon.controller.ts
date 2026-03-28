import { Request, Response } from 'express';
import Coupon from '../models/coupon.model';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import sendResponse from '../utils/sendResponse';

// POST /api/v1/coupons/validate  (public)
const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, orderTotal } = req.body;
  if (!code) throw new AppError('Coupon code is required', 400);

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon || !coupon.isActive) throw new AppError('Invalid or inactive coupon code', 400);

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new AppError('This coupon has expired', 400);
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    throw new AppError('This coupon has reached its usage limit', 400);
  }

  const total = Number(orderTotal) || 0;
  if (total < coupon.minOrderAmount) {
    throw new AppError(
      `Minimum order amount for this coupon is ${coupon.minOrderAmount}`,
      400
    );
  }

  const discount =
    coupon.type === 'percent'
      ? Math.min((total * coupon.value) / 100, total)
      : Math.min(coupon.value, total);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Coupon applied! You save ${discount.toFixed(2)}`,
    data: {
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      discount: parseFloat(discount.toFixed(2)),
    },
  });
});

// GET /api/v1/coupons  (admin)
const getCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Coupons retrieved successfully',
    data: coupons,
  });
});

// POST /api/v1/coupons  (admin)
const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, description, type, value, minOrderAmount, maxUses, expiresAt } = req.body;

  const existing = await Coupon.findOne({ code: code?.toUpperCase()?.trim() });
  if (existing) throw new AppError('Coupon code already exists', 400);

  const coupon = await Coupon.create({
    code,
    description,
    type,
    value,
    minOrderAmount: minOrderAmount ?? 0,
    maxUses: maxUses ?? 0,
    expiresAt: expiresAt || undefined,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Coupon created successfully',
    data: coupon,
  });
});

// PATCH /api/v1/coupons/:id  (admin)
const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { description, type, value, minOrderAmount, maxUses, expiresAt, isActive } = req.body;

  const update: Record<string, any> = {};
  if (description !== undefined) update.description = description;
  if (type !== undefined) update.type = type;
  if (value !== undefined) update.value = value;
  if (minOrderAmount !== undefined) update.minOrderAmount = minOrderAmount;
  if (maxUses !== undefined) update.maxUses = maxUses;
  if (expiresAt !== undefined) update.expiresAt = expiresAt || null;
  if (isActive !== undefined) update.isActive = isActive;

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!coupon) throw new AppError('Coupon not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Coupon updated successfully',
    data: coupon,
  });
});

// DELETE /api/v1/coupons/:id  (admin)
const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new AppError('Coupon not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Coupon deleted successfully',
  });
});

export const couponControllers = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon };
