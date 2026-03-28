import { Request, Response } from 'express';
import Notification from '../models/notification.model';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import sendResponse from '../utils/sendResponse';

// GET /api/v1/notifications
const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};
  if (req.query.isRead === 'true') filter.isRead = true;
  if (req.query.isRead === 'false') filter.isRead = false;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Notifications retrieved',
    data: notifications,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/v1/notifications/unread-count
const getUnreadCount = asyncHandler(async (_req: Request, res: Response) => {
  const count = await Notification.countDocuments({ isRead: false });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Unread count retrieved',
    data: { count },
  });
});

// PATCH /api/v1/notifications/:id/read
const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
});

// PATCH /api/v1/notifications/read-all
const markAllAsRead = asyncHandler(async (_req: Request, res: Response) => {
  const result = await Notification.updateMany({ isRead: false }, { isRead: true });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${result.modifiedCount} notifications marked as read`,
  });
});

// DELETE /api/v1/notifications/:id
const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) throw new AppError('Notification not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Notification deleted',
  });
});

export const notificationControllers = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
