"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
// GET /api/v1/users/me
const getProfile = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(req.user.id);
    if (!user)
        throw new AppError_1.default('User not found', 404);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
    });
}));
// PATCH /api/v1/users/me
const updateProfile = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, avatar, address, currentPassword, newPassword } = req.body;
    const updateData = {};
    if (name)
        updateData.name = name;
    if (phone)
        updateData.phone = phone;
    if (avatar)
        updateData.avatar = avatar;
    if (address)
        updateData.address = address;
    // Handle password change
    if (newPassword) {
        const user = yield user_model_1.default.findById(req.user.id).select('+password');
        if (!user)
            throw new AppError_1.default('User not found', 404);
        if (!currentPassword)
            throw new AppError_1.default('Current password is required', 400);
        const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch)
            throw new AppError_1.default('Current password is incorrect', 400);
        user.password = newPassword;
        yield user.save();
        if (Object.keys(updateData).length === 0) {
            return (0, sendResponse_1.default)(res, {
                statusCode: 200,
                success: true,
                message: 'Password updated successfully',
            });
        }
    }
    const updated = yield user_model_1.default.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Profile updated successfully',
        data: updated,
    });
}));
// GET /api/v1/users  (admin)
const getAllUsers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const query = {};
    if (req.query.role)
        query.role = req.query.role;
    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ];
    }
    const [users, total] = yield Promise.all([
        user_model_1.default.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
        user_model_1.default.countDocuments(query),
    ]);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}));
// GET /api/v1/users/:id  (admin)
const getUserById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(req.params.id);
    if (!user)
        throw new AppError_1.default('User not found', 404);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'User retrieved successfully',
        data: user,
    });
}));
// PATCH /api/v1/users/role  (admin)
const updateUserRole = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, role } = req.body;
    if (!['user', 'admin', 'super-admin'].includes(role))
        throw new AppError_1.default('Invalid role', 400);
    // Only super-admin can assign the super-admin role
    if (role === 'super-admin' && req.user.role !== 'super-admin') {
        throw new AppError_1.default('Only a super-admin can assign the super-admin role', 403);
    }
    const target = yield user_model_1.default.findById(userId);
    if (!target)
        throw new AppError_1.default('User not found', 404);
    // super-admin accounts cannot be demoted by regular admins
    if (target.role === 'super-admin' && req.user.role !== 'super-admin') {
        throw new AppError_1.default('Cannot modify a super-admin account', 403);
    }
    target.role = role;
    yield target.save();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'User role updated successfully',
        data: target,
    });
}));
// POST /api/v1/users  (super-admin — create a new admin account directly)
const createAdminUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role = 'admin' } = req.body;
    if (!name || !email || !password)
        throw new AppError_1.default('Name, email, and password are required', 400);
    if (!['admin', 'super-admin'].includes(role))
        throw new AppError_1.default('Role must be admin or super-admin', 400);
    const existing = yield user_model_1.default.findOne({ email });
    if (existing)
        throw new AppError_1.default('A user with this email already exists', 409);
    const user = yield user_model_1.default.create({ name, email, password, role, isVerified: true });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Admin account created successfully',
        data: user,
    });
}));
// DELETE /api/v1/users/:id  (admin)
const deleteUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const target = yield user_model_1.default.findById(req.params.id);
    if (!target)
        throw new AppError_1.default('User not found', 404);
    // Prevent deleting any super-admin account
    if (target.role === 'super-admin') {
        throw new AppError_1.default('Super-admin accounts cannot be deleted', 403);
    }
    // Regular admin cannot delete another admin
    if (target.role === 'admin' && req.user.role !== 'super-admin') {
        throw new AppError_1.default('Only a super-admin can delete admin accounts', 403);
    }
    yield target.deleteOne();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'User deleted successfully',
    });
}));
exports.userControllers = {
    getProfile,
    updateProfile,
    getAllUsers,
    getUserById,
    updateUserRole,
    createAdminUser,
    deleteUser,
};
