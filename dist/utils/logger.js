"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timestamp = () => new Date().toISOString();
const logger = {
    info: (message, ...args) => console.log(`[${timestamp()}] INFO: ${message}`, ...args),
    error: (message, ...args) => console.error(`[${timestamp()}] ERROR: ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[${timestamp()}] WARN: ${message}`, ...args),
};
exports.default = logger;
