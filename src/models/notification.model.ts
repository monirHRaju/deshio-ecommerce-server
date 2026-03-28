import { Schema, model } from 'mongoose';
import { INotification } from '../types';

const notificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ['order', 'product', 'payment', 'user', 'review', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    referenceId: { type: Schema.Types.ObjectId },
    referenceModel: {
      type: String,
      enum: ['Order', 'Product', 'User', 'Review'],
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ isRead: 1, createdAt: -1 });

const Notification = model<INotification>('Notification', notificationSchema);
export default Notification;
