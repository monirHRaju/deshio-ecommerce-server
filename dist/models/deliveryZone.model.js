"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const deliveryZoneSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    charge: { type: Number, required: true, min: 0 },
    estimatedDays: { type: String, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
const DeliveryZone = (0, mongoose_1.model)('DeliveryZone', deliveryZoneSchema);
exports.default = DeliveryZone;
