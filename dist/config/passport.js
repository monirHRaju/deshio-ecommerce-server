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
const crypto_1 = __importDefault(require("crypto"));
const passport_1 = __importDefault(require("passport"));
const passport_facebook_1 = require("passport-facebook");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const _1 = __importDefault(require("."));
const user_model_1 = __importDefault(require("../models/user.model"));
passport_1.default.serializeUser((user, done) => done(null, user._id));
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(id);
        done(null, user);
    }
    catch (err) {
        done(err);
    }
}));
// ─── Google ──────────────────────────────────────────────────────────────────
if (_1.default.google_client_id) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: _1.default.google_client_id,
        clientSecret: _1.default.google_client_secret,
        callbackURL: `${_1.default.server_url}/api/v1/auth/google/callback`,
    }, (_accessToken, _refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
            if (!email)
                return done(new Error('No email from Google'), false);
            let user = yield user_model_1.default.findOne({ googleId: profile.id });
            if (!user) {
                user = yield user_model_1.default.findOne({ email });
                if (user) {
                    user.googleId = profile.id;
                    yield user.save();
                }
                else {
                    user = yield user_model_1.default.create({
                        name: profile.displayName,
                        email,
                        googleId: profile.id,
                        avatar: (_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value,
                        isVerified: true, // Google emails are pre-verified
                        password: crypto_1.default.randomBytes(32).toString('hex'),
                    });
                }
            }
            done(null, user);
        }
        catch (err) {
            done(err, false);
        }
    })));
}
// ─── Facebook ────────────────────────────────────────────────────────────────
if (_1.default.facebook_app_id) {
    passport_1.default.use(new passport_facebook_1.Strategy({
        clientID: _1.default.facebook_app_id,
        clientSecret: _1.default.facebook_app_secret,
        callbackURL: `${_1.default.server_url}/api/v1/auth/facebook/callback`,
        profileFields: ['id', 'emails', 'name', 'photos'],
    }, (_accessToken, _refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
            if (!email)
                return done(new Error('No email from Facebook'), false);
            let user = yield user_model_1.default.findOne({ facebookId: profile.id });
            if (!user) {
                user = yield user_model_1.default.findOne({ email });
                if (user) {
                    user.facebookId = profile.id;
                    yield user.save();
                }
                else {
                    user = yield user_model_1.default.create({
                        name: `${(_c = profile.name) === null || _c === void 0 ? void 0 : _c.givenName} ${(_d = profile.name) === null || _d === void 0 ? void 0 : _d.familyName}`.trim(),
                        email,
                        facebookId: profile.id,
                        avatar: (_f = (_e = profile.photos) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value,
                        isVerified: true,
                        password: crypto_1.default.randomBytes(32).toString('hex'),
                    });
                }
            }
            done(null, user);
        }
        catch (err) {
            done(err, false);
        }
    })));
}
exports.default = passport_1.default;
