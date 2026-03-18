import { Schema, model } from 'mongoose';
import { ICategory } from '../types';

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String, default: 'https://placehold.co/400x300' },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
  },
  { timestamps: true }
);

const Category = model<ICategory>('Category', categorySchema);
export default Category;
