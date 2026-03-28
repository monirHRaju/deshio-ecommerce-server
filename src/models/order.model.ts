import mongoose, { Schema, model } from 'mongoose';
import { IOrder } from '../types';

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    title: { type: String, required: true },
    image: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      country: { type: String },
      zip: { type: String },
    },
    phone: { type: String, required: true },
    paymentMethod: { type: String, required: true, default: 'card' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    deliveryZoneId: { type: Schema.Types.ObjectId, ref: 'DeliveryZone' },
    deliveryCharge: { type: Number, default: 0 },
    codProcessingFee: { type: Number, default: 0 },
    orderNote: { type: String },
    mobilePayment: {
      paymentMethodId: { type: Schema.Types.ObjectId, ref: 'PaymentMethod' },
      paymentMethodName: { type: String },
      mobileLast4: { type: String },
      transactionId: { type: String },
    },
  },
  { timestamps: true }
);

// Auto-generate order number before save
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const OrderModel = mongoose.models['Order'] || model('Order', orderSchema);
    const count = await OrderModel.countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
  }
});

const Order = model<IOrder>('Order', orderSchema);
export default Order;
