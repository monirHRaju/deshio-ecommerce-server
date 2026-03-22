"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiModel = void 0;
const generative_ai_1 = require("@google/generative-ai");
const config_1 = __importDefault(require("../config"));
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.default.gemini_api_key);
exports.geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
