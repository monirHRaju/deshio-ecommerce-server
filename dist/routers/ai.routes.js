"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiRoutes = void 0;
const express_1 = __importDefault(require("express"));
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = express_1.default.Router();
// Public (no auth required)
router.post('/summarize-reviews', ai_controller_1.aiControllers.summarizeReviews);
// Protected
router.use(auth_middleware_1.default);
router.post('/generate-description', ai_controller_1.aiControllers.generateProductDescription);
router.post('/generate-tags', ai_controller_1.aiControllers.generateProductTags);
router.post('/smart-search', ai_controller_1.aiControllers.smartSearch);
exports.AiRoutes = router;
