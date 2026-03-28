import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import config from '../config';
import passportInstance from '../config/passport';
import User from '../models/user.model';
import { IUser, JwtPayload } from '../types';
import AppError from '../utils/AppError';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/email';
import asyncHandler from '../utils/asyncHandler';
import { createNotification } from '../utils/notificationService';
import sendResponse from '../utils/sendResponse';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, config.jwt_secret as Secret, {
    expiresIn: config.jwt_expires_in as any,
  });
  const refreshToken = jwt.sign(payload, config.jwt_refresh_secret as Secret, {
    expiresIn: config.jwt_refresh_expires_in as any,
  });
  return { accessToken, refreshToken };
};

const oauthRedirect = (res: Response, user: IUser & { _id: any }) => {
  const payload: JwtPayload = { id: String(user._id), email: user.email, role: user.role };
  const { accessToken, refreshToken } = generateTokens(payload);
  res.redirect(
    `${config.client_url}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
  );
};

// ─── Register ────────────────────────────────────────────────────────────────

const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('User already exists with this email', 400);

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
    verificationTokenExpires,
  });

  // Notification: new user registered
  createNotification({
    type: 'user',
    title: 'New User Registered',
    message: `${user.name} (${user.email}) has registered`,
    referenceId: user._id,
    referenceModel: 'User',
  }).catch(console.error);

  // Send verification email (non-blocking)
  sendVerificationEmail(name, email, verificationToken).catch((err) => {
    console.error('[Email] Verification email failed:', err.message);
    console.error('[Email] Full error:', err);
  });

  const payload: JwtPayload = { id: String(user._id), email: user.email, role: user.role };
  const { accessToken, refreshToken } = generateTokens(payload);

  const userObj = user.toObject();
  delete userObj.password;

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Registered successfully. Please check your email to verify your account.',
    data: { user: userObj, accessToken, refreshToken },
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);

  // OAuth-only account
  if (!user.password) {
    throw new AppError('This account uses social login. Please sign in with Google or Facebook.', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password as string);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const payload: JwtPayload = { id: String(user._id), email: user.email, role: user.role };
  const { accessToken, refreshToken } = generateTokens(payload);

  const userObj = user.toObject();
  delete userObj.password;

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Login successful',
    data: { user: userObj, accessToken, refreshToken },
  });
});

// ─── Refresh Token ───────────────────────────────────────────────────────────

const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new AppError('Refresh token required', 400);

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, config.jwt_refresh_secret as Secret) as JwtPayload;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User not found', 404);

  const payload: JwtPayload = { id: String(user._id), email: user.email, role: user.role };
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Token refreshed successfully',
    data: { accessToken, refreshToken: newRefreshToken },
  });
});

// ─── Verify Email ─────────────────────────────────────────────────────────────

const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  if (!token) throw new AppError('Token is required', 400);

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  }).select('+verificationToken +verificationTokenExpires');

  if (!user) throw new AppError('Invalid or expired verification link', 400);

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Email verified successfully! You can now place orders.',
    data: null,
  });
});

// ─── Resend Verification ──────────────────────────────────────────────────────

const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select('+verificationToken +verificationTokenExpires');
  if (!user) throw new AppError('No account found with that email', 404);
  if (user.isVerified) throw new AppError('Email is already verified', 400);

  const token = crypto.randomBytes(32).toString('hex');
  user.verificationToken = token;
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user.name, email, token);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Verification email sent. Please check your inbox.',
    data: null,
  });
});

// ─── Forgot Password ──────────────────────────────────────────────────────────

const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) throw new AppError('No account found with that email', 404);

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await user.save();

  await sendPasswordResetEmail(user.name, email, token);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset link sent to your email.',
    data: null,
  });
});

// ─── Reset Password ───────────────────────────────────────────────────────────

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) throw new AppError('Token and new password are required', 400);

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) throw new AppError('Invalid or expired reset link', 400);

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset successful. You can now log in.',
    data: null,
  });
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

const googleAuth = (req: Request, res: Response, next: any) => {
  if (!config.google_client_id) {
    return res.redirect(`${config.client_url}/login?error=google_not_configured`);
  }
  passportInstance.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
};

const googleCallback = (req: Request, res: Response, _next: any) => {
  passportInstance.authenticate('google', { session: false, failureRedirect: `${config.client_url}/login?error=google_failed` })(
    req,
    res,
    () => oauthRedirect(res, req.user as unknown as IUser & { _id: any })
  );
};

// ─── Facebook OAuth ───────────────────────────────────────────────────────────

const facebookAuth = (req: Request, res: Response, next: any) => {
  if (!config.facebook_app_id) {
    return res.redirect(`${config.client_url}/login?error=facebook_not_configured`);
  }
  passportInstance.authenticate('facebook', { scope: ['email'], session: false })(req, res, next);
};

const facebookCallback = (req: Request, res: Response, _next: any) => {
  passportInstance.authenticate('facebook', { session: false, failureRedirect: `${config.client_url}/login?error=facebook_failed` })(
    req,
    res,
    () => oauthRedirect(res, req.user as unknown as IUser & { _id: any })
  );
};

export const authControllers = {
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
