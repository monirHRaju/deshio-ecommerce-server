import { Types } from 'mongoose';

// ─── User ────────────────────────────────────────────────────────────────────
export interface IAddress {
  street?: string;
  city?: string;
  country?: string;
  zip?: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  address?: IAddress;
  wishlist?: Types.ObjectId[];
  // Email verification
  isVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  // Password reset
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // OAuth
  googleId?: string;
  facebookId?: string;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface ICategory {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: Types.ObjectId;
}

// ─── Product ─────────────────────────────────────────────────────────────────
export interface IProduct {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  images?: string[];
  price: number;
  category: Types.ObjectId | string;
  brand?: string;
  discount?: number;
  isFeatured?: boolean;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  stock: number;
  sold?: number;
  specifications?: Map<string, string>;
  createdBy: Types.ObjectId | string;
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface IReview {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  rating: number;
  comment: string;
  helpful?: number;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  title: string;
  image: string;
}

export interface IOrder {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  orderNumber?: string;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: IAddress;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  couponCode?: string;
  couponDiscount?: number;
  deliveryZoneId?: Types.ObjectId;
  deliveryCharge?: number;
  orderNote?: string;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────
export interface ICoupon {
  _id?: Types.ObjectId;
  code: string;
  description?: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
}

// ─── Delivery Zone ────────────────────────────────────────────────────────────
export interface IDeliveryZone {
  _id?: Types.ObjectId;
  name: string;
  charge: number;
  estimatedDays: string;
  isActive: boolean;
}

// ─── JWT ─────────────────────────────────────────────────────────────────────
export interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// ─── Express augmentation ────────────────────────────────────────────────────
// Merge JwtPayload into passport's Express.User so req.user is typed correctly
declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}
