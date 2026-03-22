import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import config from '../config';
import User from '../models/user.model';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import sendResponse from '../utils/sendResponse';

// GET /api/v1/users/me
const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile retrieved successfully',
    data: user,
  });
});

// PATCH /api/v1/users/me
const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, avatar, address, currentPassword, newPassword } = req.body;

  const updateData: Record<string, any> = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (avatar) updateData.avatar = avatar;
  if (address) updateData.address = address;

  // Handle password change
  if (newPassword) {
    const user = await User.findById(req.user!.id).select('+password');
    if (!user) throw new AppError('User not found', 404);
    if (!currentPassword) throw new AppError('Current password is required', 400);
    const isMatch = await bcrypt.compare(currentPassword, user.password as string);
    if (!isMatch) throw new AppError('Current password is incorrect', 400);
    user.password = newPassword;
    await user.save();
    if (Object.keys(updateData).length === 0) {
      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Password updated successfully',
      });
    }
  }

  const updated = await User.findByIdAndUpdate(req.user!.id, updateData, {
    new: true,
    runValidators: true,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: updated,
  });
});

// GET /api/v1/users  (admin)
const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/v1/users/:id  (admin)
const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
});

// PATCH /api/v1/users/role  (admin)
const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = req.body;
  if (!['user', 'admin', 'super-admin'].includes(role)) throw new AppError('Invalid role', 400);

  // Only super-admin can assign the super-admin role
  if (role === 'super-admin' && req.user!.role !== 'super-admin') {
    throw new AppError('Only a super-admin can assign the super-admin role', 403);
  }

  const target = await User.findById(userId);
  if (!target) throw new AppError('User not found', 404);

  // super-admin accounts cannot be demoted by regular admins
  if (target.role === 'super-admin' && req.user!.role !== 'super-admin') {
    throw new AppError('Cannot modify a super-admin account', 403);
  }

  target.role = role;
  await target.save();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User role updated successfully',
    data: target,
  });
});

// POST /api/v1/users  (super-admin — create a new admin account directly)
const createAdminUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role = 'admin' } = req.body;

  if (!name || !email || !password) throw new AppError('Name, email, and password are required', 400);
  if (!['admin', 'super-admin'].includes(role)) throw new AppError('Role must be admin or super-admin', 400);

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('A user with this email already exists', 409);

  const user = await User.create({ name, email, password, role, isVerified: true });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Admin account created successfully',
    data: user,
  });
});

// DELETE /api/v1/users/:id  (admin)
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const target = await User.findById(req.params.id);
  if (!target) throw new AppError('User not found', 404);

  // Prevent deleting any super-admin account
  if (target.role === 'super-admin') {
    throw new AppError('Super-admin accounts cannot be deleted', 403);
  }

  // Regular admin cannot delete another admin
  if (target.role === 'admin' && req.user!.role !== 'super-admin') {
    throw new AppError('Only a super-admin can delete admin accounts', 403);
  }

  await target.deleteOne();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User deleted successfully',
  });
});

export const userControllers = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  createAdminUser,
  deleteUser,
};
