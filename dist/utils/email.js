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
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const createTransporter = () => nodemailer_1.default.createTransport({
    host: config_1.default.email_host,
    port: Number(config_1.default.email_port),
    secure: Number(config_1.default.email_port) === 465,
    auth: { user: config_1.default.email_user, pass: config_1.default.email_pass },
});
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    if (!config_1.default.email_user) {
        console.warn(`[Email] Not configured — skipping email to ${to}: ${subject}`);
        return;
    }
    const transporter = createTransporter();
    yield transporter.sendMail({ from: config_1.default.email_from, to, subject, html });
    console.log(`[Email] Sent to ${to}: ${subject}`);
});
const sendVerificationEmail = (name, email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${config_1.default.client_url}/verify-email?token=${token}`;
    yield sendEmail(email, 'Verify your Deshio account', `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px">
      <h2 style="color:#0EA5E9;margin-bottom:8px">Welcome to Deshio, ${name}!</h2>
      <p style="color:#475569">Please verify your email address to unlock all features including placing orders.</p>
      <a href="${url}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#0EA5E9;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
      <p style="color:#94a3b8;font-size:13px">Link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
    </div>
    `);
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = (name, email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${config_1.default.client_url}/reset-password?token=${token}`;
    yield sendEmail(email, 'Reset your Deshio password', `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px">
      <h2 style="color:#0EA5E9;margin-bottom:8px">Password Reset Request</h2>
      <p style="color:#475569">Hi ${name}, we received a request to reset your password.</p>
      <a href="${url}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#0EA5E9;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
      <p style="color:#94a3b8;font-size:13px">Link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    </div>
    `);
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
