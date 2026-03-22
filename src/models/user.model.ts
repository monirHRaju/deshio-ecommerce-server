import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../config';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, default: 'user' },
    email: { type: String, required: true, unique: true },
    password: { type: String, minlength: 6, select: false }, // optional for OAuth users
    role: { type: String, required: true, enum: ['user', 'admin', 'super-admin'], default: 'user' },
    avatar: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${Math.random()}`;
      },
    },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      country: { type: String },
      zip: { type: String },
    },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    // Email verification
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    // OAuth
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
  },
  { timestamps: true }
);

// Hash password before save (skip for OAuth users with no password)
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password as string, Number(config.bcrypt_salt_rounds));
});

// Log creation
userSchema.post('save', function (user) {
  console.log(`[Post-Save Hook]: User saved: ${user.email}`);
});

const User = model<IUser>('User', userSchema);
export default User;
