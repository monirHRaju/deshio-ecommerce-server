import nodemailer from 'nodemailer';
import config from '../config';

const createTransporter = () =>
  nodemailer.createTransport({
    host: config.email_host,
    port: Number(config.email_port),
    secure: Number(config.email_port) === 465,
    auth: { user: config.email_user, pass: config.email_pass },
  });

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!config.email_user) {
    console.warn(`[Email] Not configured — skipping email to ${to}: ${subject}`);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({ from: config.email_from, to, subject, html });
  console.log(`[Email] Sent to ${to}: ${subject}`);
};

export const sendVerificationEmail = async (name: string, email: string, token: string) => {
  const url = `${config.client_url}/verify-email?token=${token}`;
  await sendEmail(
    email,
    'Verify your Deshio account',
    `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px">
      <h2 style="color:#0EA5E9;margin-bottom:8px">Welcome to Deshio, ${name}!</h2>
      <p style="color:#475569">Please verify your email address to unlock all features including placing orders.</p>
      <a href="${url}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#0EA5E9;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
      <p style="color:#94a3b8;font-size:13px">Link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
    </div>
    `
  );
};

export const sendPasswordResetEmail = async (name: string, email: string, token: string) => {
  const url = `${config.client_url}/reset-password?token=${token}`;
  await sendEmail(
    email,
    'Reset your Deshio password',
    `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px">
      <h2 style="color:#0EA5E9;margin-bottom:8px">Password Reset Request</h2>
      <p style="color:#475569">Hi ${name}, we received a request to reset your password.</p>
      <a href="${url}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#0EA5E9;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
      <p style="color:#94a3b8;font-size:13px">Link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    </div>
    `
  );
};
