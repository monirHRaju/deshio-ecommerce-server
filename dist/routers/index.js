"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ai_routes_1 = require("./ai.routes");
const auth_routes_1 = require("./auth.routes");
const cart_routes_1 = require("./cart.routes");
const category_routes_1 = require("./category.routes");
const coupon_routes_1 = require("./coupon.routes");
const dashboard_routes_1 = require("./dashboard.routes");
const deliveryZone_routes_1 = require("./deliveryZone.routes");
const order_routes_1 = require("./order.routes");
const product_route_1 = require("./product.route");
const review_routes_1 = require("./review.routes");
const user_router_1 = require("./user.router");
const router = express_1.default.Router();
const moduleRoutes = [
    { path: '/auth', route: auth_routes_1.AuthRoutes },
    { path: '/users', route: user_router_1.UserRoutes },
    { path: '/categories', route: category_routes_1.CategoryRoutes },
    { path: '/products', route: product_route_1.ProductRoutes },
    { path: '/reviews', route: review_routes_1.ReviewRoutes },
    { path: '/cart', route: cart_routes_1.CartRoutes },
    { path: '/orders', route: order_routes_1.OrderRoutes },
    { path: '/coupons', route: coupon_routes_1.CouponRoutes },
    { path: '/delivery-zones', route: deliveryZone_routes_1.DeliveryZoneRoutes },
    { path: '/dashboard', route: dashboard_routes_1.DashboardRoutes },
    { path: '/ai', route: ai_routes_1.AiRoutes },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
