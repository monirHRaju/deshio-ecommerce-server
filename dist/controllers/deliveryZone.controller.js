"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryZoneControllers = void 0;
const deliveryZone_model_1 = __importDefault(require("../models/deliveryZone.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
// GET /api/v1/delivery-zones  (public — active only)
const getDeliveryZones = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const zones = yield deliveryZone_model_1.default.find({ isActive: true }).sort({ charge: 1 });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Delivery zones retrieved successfully',
        data: zones,
    });
}));
// POST /api/v1/delivery-zones  (admin)
const createDeliveryZone = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, charge, estimatedDays } = req.body;
    const zone = yield deliveryZone_model_1.default.create({ name, charge, estimatedDays });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Delivery zone created successfully',
        data: zone,
    });
}));
// PATCH /api/v1/delivery-zones/:id  (admin)
const updateDeliveryZone = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, charge, estimatedDays, isActive } = req.body;
    const update = {};
    if (name !== undefined)
        update.name = name;
    if (charge !== undefined)
        update.charge = charge;
    if (estimatedDays !== undefined)
        update.estimatedDays = estimatedDays;
    if (isActive !== undefined)
        update.isActive = isActive;
    const zone = yield deliveryZone_model_1.default.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!zone)
        throw new AppError_1.default('Delivery zone not found', 404);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Delivery zone updated successfully',
        data: zone,
    });
}));
// DELETE /api/v1/delivery-zones/:id  (admin)
const deleteDeliveryZone = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const zone = yield deliveryZone_model_1.default.findByIdAndDelete(req.params.id);
    if (!zone)
        throw new AppError_1.default('Delivery zone not found', 404);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Delivery zone deleted successfully',
    });
}));
exports.deliveryZoneControllers = {
    getDeliveryZones,
    createDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
};
