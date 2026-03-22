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
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../config"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, default: 'user' },
    email: { type: String, required: true, unique: true },
    password: { type: String, minlength: 6, select: false }, // optional for OAuth users
    role: { type: String, required: true, enum: ['user', 'admin', 'super-admin'], default: 'user' },
    avatar: {
        type: String,
        default: function () {
            return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${Math.random()}`;
        },
    },
    phone: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        country: { type: String },
        zip: { type: String },
    },
    wishlist: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' }],
    // Email verification
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    // OAuth
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
}, { timestamps: true });
// Hash password before save (skip for OAuth users with no password)
userSchema.pre('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password') || !this.password)
            return;
        this.password = yield bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
    });
});
// Log creation
userSchema.post('save', function (user) {
    console.log(`[Post-Save Hook]: User saved: ${user.email}`);
});
const User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
