import { Request, Response } from 'express';
import DeliveryZone from '../models/deliveryZone.model';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import sendResponse from '../utils/sendResponse';

// GET /api/v1/delivery-zones  (public — active only)
const getDeliveryZones = asyncHandler(async (_req: Request, res: Response) => {
  const zones = await DeliveryZone.find({ isActive: true }).sort({ charge: 1 });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Delivery zones retrieved successfully',
    data: zones,
  });
});

// POST /api/v1/delivery-zones  (admin)
const createDeliveryZone = asyncHandler(async (req: Request, res: Response) => {
  const { name, charge, estimatedDays } = req.body;
  const zone = await DeliveryZone.create({ name, charge, estimatedDays });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Delivery zone created successfully',
    data: zone,
  });
});

// PATCH /api/v1/delivery-zones/:id  (admin)
const updateDeliveryZone = asyncHandler(async (req: Request, res: Response) => {
  const { name, charge, estimatedDays, isActive } = req.body;
  const update: Record<string, any> = {};
  if (name !== undefined) update.name = name;
  if (charge !== undefined) update.charge = charge;
  if (estimatedDays !== undefined) update.estimatedDays = estimatedDays;
  if (isActive !== undefined) update.isActive = isActive;

  const zone = await DeliveryZone.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!zone) throw new AppError('Delivery zone not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Delivery zone updated successfully',
    data: zone,
  });
});

// DELETE /api/v1/delivery-zones/:id  (admin)
const deleteDeliveryZone = asyncHandler(async (req: Request, res: Response) => {
  const zone = await DeliveryZone.findByIdAndDelete(req.params.id);
  if (!zone) throw new AppError('Delivery zone not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Delivery zone deleted successfully',
  });
});

export const deliveryZoneControllers = {
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
};
