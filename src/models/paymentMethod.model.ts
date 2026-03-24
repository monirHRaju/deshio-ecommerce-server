import { Schema, model } from 'mongoose';
import { IPaymentMethod } from '../types';

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    instructions: { type: String, required: true },
    phoneNumber: { type: String, trim: true },
    qrImage: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PaymentMethod = model<IPaymentMethod>('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;
