"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, options) => {
    const { statusCode, success, message, data, meta } = options;
    res.status(statusCode).json(Object.assign(Object.assign({ success,
        message }, (data !== undefined && { data })), (meta !== undefined && { meta })));
};
exports.default = sendResponse;
