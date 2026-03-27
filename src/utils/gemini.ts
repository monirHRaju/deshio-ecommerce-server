import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';

const genAI = new GoogleGenerativeAI(config.gemini_api_key as string);

export const geminiModelForChat = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
export const geminiModelTags = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
