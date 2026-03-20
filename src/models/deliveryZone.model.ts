import { Schema, model } from 'mongoose';
import { IDeliveryZone } from '../types';

const deliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    charge: { type: Number, required: true, min: 0 },
    estimatedDays: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const DeliveryZone = model<IDeliveryZone>('DeliveryZone', deliveryZoneSchema);
export default DeliveryZone;
