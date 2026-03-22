"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
require("./config/passport"); // initialize passport strategies
const AppError_1 = __importDefault(require("./utils/AppError"));
const routers_1 = __importDefault(require("./routers"));
const app = (0, express_1.default)();
// Parsers
app.use(express_1.default.json());
// CORS — allow all configured origins (comma-separated PUBLIC_URL supports multiple)
const allowedOrigins = (process.env.PUBLIC_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // allow server-to-server (no origin) and whitelisted origins
        if (!origin || allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    optionsSuccessStatus: 200,
}));
// Application routes
app.use('/api/v1', routers_1.default);
// Root health check
app.get('/', (_req, res) => {
    res.send('Deshio e-commerce Server is running!');
});
// 404 handler
app.use((_req, _res, next) => {
    next(new AppError_1.default('Route not found', 404));
});
// Global error handler
app.use((err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Something went wrong';
    // Always log non-operational errors so they're visible in the server terminal
    if (!err.isOperational)
        console.error('[Error]', err);
    res.status(statusCode).json(Object.assign({ success: false, message }, (process.env.NODE_ENV !== 'production' && { debug: err.message, stack: err.stack })));
});
exports.default = app;
