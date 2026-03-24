import { Request, Response } from 'express';
import PaymentMethod from '../models/paymentMethod.model';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import sendResponse from '../utils/sendResponse';

// GET /api/v1/payment-methods  (public — active only)
const getActivePaymentMethods = asyncHandler(async (_req: Request, res: Response) => {
  const methods = await PaymentMethod.find({ isActive: true }).sort({ sortOrder: 1 });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Active payment methods retrieved',
    data: methods,
  });
});

// GET /api/v1/payment-methods/all  (admin)
const getAllPaymentMethods = asyncHandler(async (_req: Request, res: Response) => {
  const methods = await PaymentMethod.find().sort({ sortOrder: 1 });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All payment methods retrieved',
    data: methods,
  });
});

// POST /api/v1/payment-methods  (admin)
const createPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const { name, type, instructions, phoneNumber, qrImage, isActive, sortOrder } = req.body;
  if (!name || !type || !instructions) {
    throw new AppError('Name, type, and instructions are required', 400);
  }

  const method = await PaymentMethod.create({
    name,
    type,
    instructions,
    phoneNumber,
    qrImage,
    isActive: isActive ?? true,
    sortOrder: sortOrder ?? 0,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payment method created',
    data: method,
  });
});

// PATCH /api/v1/payment-methods/:id  (admin)
const updatePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const method = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!method) throw new AppError('Payment method not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment method updated',
    data: method,
  });
});

// DELETE /api/v1/payment-methods/:id  (admin)
const deletePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const method = await PaymentMethod.findByIdAndDelete(req.params.id);
  if (!method) throw new AppError('Payment method not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment method deleted',
    data: null,
  });
});

export const paymentMethodControllers = {
  getActivePaymentMethods,
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};
