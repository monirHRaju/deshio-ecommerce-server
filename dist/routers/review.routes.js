"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = express_1.default.Router();
router.get('/product/:productId', review_controller_1.reviewControllers.getProductReviews);
router.get('/my', auth_middleware_1.default, review_controller_1.reviewControllers.getMyReviews);
router.post('/', auth_middleware_1.default, review_controller_1.reviewControllers.addReview);
router.patch('/:id', auth_middleware_1.default, review_controller_1.reviewControllers.updateReview);
router.delete('/:id', auth_middleware_1.default, review_controller_1.reviewControllers.deleteReview);
exports.ReviewRoutes = router;
