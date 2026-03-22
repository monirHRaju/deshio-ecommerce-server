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
exports.authControllers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const passport_1 = __importDefault(require("../config/passport"));
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const email_1 = require("../utils/email");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
// ─── Helpers ─────────────────────────────────────────────────────────────────
const generateTokens = (payload) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, config_1.default.jwt_secret, {
        expiresIn: config_1.default.jwt_expires_in,
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.default.jwt_refresh_secret, {
        expiresIn: config_1.default.jwt_refresh_expires_in,
    });
    return { accessToken, refreshToken };
};
const oauthRedirect = (res, user) => {
    const payload = { id: String(user._id), email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);
    res.redirect(`${config_1.default.client_url}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
};
// ─── Register ────────────────────────────────────────────────────────────────
const register = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    const existing = yield user_model_1.default.findOne({ email });
    if (existing)
        throw new AppError_1.default('User already exists with this email', 400);
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    const user = yield user_model_1.default.create({
        name,
        email,
        password,
        role,
        verificationToken,
        verificationTokenExpires,
    });
    // Send verification email (non-blocking)
    (0, email_1.sendVerificationEmail)(name, email, verificationToken).catch((err) => {
        console.error('[Email] Verification email failed:', err.message);
        console.error('[Email] Full error:', err);
    });
    const payload = { id: String(user._id), email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);
    const userObj = user.toObject();
    delete userObj.password;
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Registered successfully. Please check your email to verify your account.',
        data: { user: userObj, accessToken, refreshToken },
    });
}));
// ─── Login ───────────────────────────────────────────────────────────────────
const login = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_model_1.default.findOne({ email }).select('+password');
    if (!user)
        throw new AppError_1.default('Invalid email or password', 401);
    // OAuth-only account
    if (!user.password) {
        throw new AppError_1.default('This account uses social login. Please sign in with Google or Facebook.', 401);
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new AppError_1.default('Invalid email or password', 401);
    const payload = { id: String(user._id), email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);
    const userObj = user.toObject();
    delete userObj.password;
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Login successful',
        data: { user: userObj, accessToken, refreshToken },
    });
}));
// ─── Refresh Token ───────────────────────────────────────────────────────────
const refreshToken = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken: token } = req.body;
    if (!token)
        throw new AppError_1.default('Refresh token required', 400);
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_refresh_secret);
    }
    catch (_a) {
        throw new AppError_1.default('Invalid or expired refresh token', 401);
    }
    const user = yield user_model_1.default.findById(decoded.id);
    if (!user)
        throw new AppError_1.default('User not found', 404);
    const payload = { id: String(user._id), email: user.email, role: user.role };
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Token refreshed successfully',
        data: { accessToken, refreshToken: newRefreshToken },
    });
}));
// ─── Verify Email ─────────────────────────────────────────────────────────────
const verifyEmail = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    if (!token)
        throw new AppError_1.default('Token is required', 400);
    const user = yield user_model_1.default.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
    }).select('+verificationToken +verificationTokenExpires');
    if (!user)
        throw new AppError_1.default('Invalid or expired verification link', 400);
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    yield user.save();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Email verified successfully! You can now place orders.',
        data: null,
    });
}));
// ─── Resend Verification ──────────────────────────────────────────────────────
const resendVerification = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield user_model_1.default.findOne({ email }).select('+verificationToken +verificationTokenExpires');
    if (!user)
        throw new AppError_1.default('No account found with that email', 404);
    if (user.isVerified)
        throw new AppError_1.default('Email is already verified', 400);
    const token = crypto_1.default.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    yield user.save();
    yield (0, email_1.sendVerificationEmail)(user.name, email, token);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Verification email sent. Please check your inbox.',
        data: null,
    });
}));
// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield user_model_1.default.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
    if (!user)
        throw new AppError_1.default('No account found with that email', 404);
    const token = crypto_1.default.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    yield user.save();
    yield (0, email_1.sendPasswordResetEmail)(user.name, email, token);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Password reset link sent to your email.',
        data: null,
    });
}));
// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = req.body;
    if (!token || !password)
        throw new AppError_1.default('Token and new password are required', 400);
    const user = yield user_model_1.default.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');
    if (!user)
        throw new AppError_1.default('Invalid or expired reset link', 400);
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    yield user.save();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Password reset successful. You can now log in.',
        data: null,
    });
}));
// ─── Google OAuth ─────────────────────────────────────────────────────────────
const googleAuth = (req, res, next) => {
    if (!config_1.default.google_client_id) {
        return res.redirect(`${config_1.default.client_url}/login?error=google_not_configured`);
    }
    passport_1.default.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
};
const googleCallback = (req, res, _next) => {
    passport_1.default.authenticate('google', { session: false, failureRedirect: `${config_1.default.client_url}/login?error=google_failed` })(req, res, () => oauthRedirect(res, req.user));
};
// ─── Facebook OAuth ───────────────────────────────────────────────────────────
const facebookAuth = (req, res, next) => {
    if (!config_1.default.facebook_app_id) {
        return res.redirect(`${config_1.default.client_url}/login?error=facebook_not_configured`);
    }
    passport_1.default.authenticate('facebook', { scope: ['email'], session: false })(req, res, next);
};
const facebookCallback = (req, res, _next) => {
    passport_1.default.authenticate('facebook', { session: false, failureRedirect: `${config_1.default.client_url}/login?error=facebook_failed` })(req, res, () => oauthRedirect(res, req.user));
};
exports.authControllers = {
    register,
    login,
    refreshToken,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    googleAuth,
    googleCallback,
    facebookAuth,
    facebookCallback,
};
