"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../utils/AppError"));
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new AppError_1.default('Not authenticated', 401));
        }
        // super-admin has all privileges
        if (req.user.role === 'super-admin')
            return next();
        if (!roles.includes(req.user.role)) {
            return next(new AppError_1.default('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.default = authorize;
