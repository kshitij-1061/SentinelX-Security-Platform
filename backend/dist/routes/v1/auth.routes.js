"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../../controllers/auth.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 authentication requests per windowMs
    message: {
        success: false,
        error: {
            code: "TOO_MANY_REQUESTS",
            message: "Too many authentication requests from this IP, please try again later."
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});
const router = (0, express_1.Router)();
router.post("/register", authLimiter, auth_controller_1.register);
router.post("/login", authLimiter, auth_controller_1.login);
router.post("/logout", auth_middleware_1.authenticate, auth_controller_1.logout);
router.get("/me", auth_middleware_1.authenticate, auth_controller_1.getMe);
exports.default = router;
