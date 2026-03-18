import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 5000,
  database_url: process.env.MONGODB_URI,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 12,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.JWT_EXPIRES_IN || '15m',
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  gemini_api_key: process.env.GEMINI_API_KEY,
  // Email
  email_host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  email_port: process.env.EMAIL_PORT || '587',
  email_user: process.env.EMAIL_USER || '',
  email_pass: process.env.EMAIL_PASS || '',
  email_from: process.env.EMAIL_FROM || 'Deshio <noreply@deshio.com>',
  // URLs
  client_url: process.env.PUBLIC_URL || 'http://localhost:3000',
  server_url: process.env.SERVER_URL || 'http://localhost:5001',
  // OAuth
  google_client_id: process.env.GOOGLE_CLIENT_ID || '',
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
  facebook_app_id: process.env.FACEBOOK_APP_ID || '',
  facebook_app_secret: process.env.FACEBOOK_APP_SECRET || '',
};
