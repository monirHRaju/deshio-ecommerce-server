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
/**
 * Safe migration — only adds delivery zones, does NOT touch any other data.
 * Run with: npm run seed:delivery
 */
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const deliveryZone_model_1 = __importDefault(require("../models/deliveryZone.model"));
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(config_1.default.database_url);
    console.log('Connected to DB…');
    // Remove existing zones and re-insert so re-running is safe
    yield deliveryZone_model_1.default.deleteMany({});
    const zones = yield deliveryZone_model_1.default.create([
        { name: 'Dhaka City', charge: 80, estimatedDays: '1-2 days', isActive: true },
        { name: 'Outside Dhaka', charge: 120, estimatedDays: '2-4 days', isActive: true },
        { name: 'International', charge: 500, estimatedDays: '7-14 days', isActive: true },
    ]);
    console.log('✅ Delivery zones created:');
    zones.forEach((z) => console.log(`   ${z.name}  →  Tk. ${z.charge}  (${z.estimatedDays})`));
    yield mongoose_1.default.disconnect();
    process.exit(0);
});
run().catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
});
