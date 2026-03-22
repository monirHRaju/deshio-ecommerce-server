"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
// Credentials
router.post('/register', auth_controller_1.authControllers.register);
router.post('/login', auth_controller_1.authControllers.login);
router.post('/refresh-token', auth_controller_1.authControllers.refreshToken);
// Email verification
router.get('/verify-email', auth_controller_1.authControllers.verifyEmail);
router.post('/resend-verification', auth_controller_1.authControllers.resendVerification);
// Password reset
router.post('/forgot-password', auth_controller_1.authControllers.forgotPassword);
router.post('/reset-password', auth_controller_1.authControllers.resetPassword);
// Google OAuth
router.get('/google', auth_controller_1.authControllers.googleAuth);
router.get('/google/callback', auth_controller_1.authControllers.googleCallback);
// Facebook OAuth
router.get('/facebook', auth_controller_1.authControllers.facebookAuth);
router.get('/facebook/callback', auth_controller_1.authControllers.facebookCallback);
exports.AuthRoutes = router;
