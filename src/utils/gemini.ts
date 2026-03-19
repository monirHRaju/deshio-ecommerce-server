import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';

const genAI = new GoogleGenerativeAI(config.gemini_api_key as string);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
