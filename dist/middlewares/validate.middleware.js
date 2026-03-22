"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../utils/AppError"));
const validate = (schema) => {
    return (req, _res, next) => {
        var _a, _b;
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const issues = (_b = (_a = result.error.errors) !== null && _a !== void 0 ? _a : result.error.issues) !== null && _b !== void 0 ? _b : [];
            const message = issues.map((e) => e.message).join(', ') || 'Validation failed';
            return next(new AppError_1.default(message, 400));
        }
        req.body = result.data;
        next();
    };
};
exports.default = validate;
