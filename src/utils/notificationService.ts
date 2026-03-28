import { Types } from 'mongoose';
import Notification from '../models/notification.model';
import { NotificationType } from '../types';

export const LOW_STOCK_THRESHOLD = 5;

export const createNotification = async (data: {
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: Types.ObjectId | string;
  referenceModel?: 'Order' | 'Product' | 'User' | 'Review';
}) => {
  try {
    await Notification.create(data);
  } catch (err: any) {
    console.error('[Notification] Failed to create notification:', err.message);
  }
};
