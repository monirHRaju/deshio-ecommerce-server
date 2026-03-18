import { Schema, model } from 'mongoose';
import { IReview } from '../types';

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Review = model<IReview>('Review', reviewSchema);
export default Review;
