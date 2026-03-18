import express from 'express';
import { authControllers } from '../controllers/auth.controller';

const router = express.Router();

// Credentials
router.post('/register', authControllers.register);
router.post('/login', authControllers.login);
router.post('/refresh-token', authControllers.refreshToken);

// Email verification
router.get('/verify-email', authControllers.verifyEmail);
router.post('/resend-verification', authControllers.resendVerification);

// Password reset
router.post('/forgot-password', authControllers.forgotPassword);
router.post('/reset-password', authControllers.resetPassword);

// Google OAuth
router.get('/google', authControllers.googleAuth);
router.get('/google/callback', authControllers.googleCallback);

// Facebook OAuth
router.get('/facebook', authControllers.facebookAuth);
router.get('/facebook/callback', authControllers.facebookCallback);

export const AuthRoutes = router;
