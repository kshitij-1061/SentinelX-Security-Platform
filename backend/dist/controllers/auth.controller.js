"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getMe = getMe;
const auth_service_1 = require("../services/auth.service");
const auth_schema_1 = require("../schemas/auth.schema");
const authService = new auth_service_1.AuthService();
async function register(req, res, next) {
    try {
        const validatedInput = auth_schema_1.registerSchema.parse(req.body);
        const ipAddress = req.ip;
        const userAgent = req.headers["user-agent"];
        const user = await authService.register(validatedInput, ipAddress, userAgent);
        res.status(201).json({
            success: true,
            data: user,
            message: "User registered successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
async function login(req, res, next) {
    try {
        const validatedInput = auth_schema_1.loginSchema.parse(req.body);
        const ipAddress = req.ip;
        const userAgent = req.headers["user-agent"];
        const result = await authService.login(validatedInput, ipAddress, userAgent);
        res.status(200).json({
            success: true,
            data: result,
            message: "Authentication successful."
        });
    }
    catch (err) {
        next(err);
    }
}
async function logout(req, res, next) {
    try {
        const userId = req.user.id;
        const ipAddress = req.ip;
        const userAgent = req.headers["user-agent"];
        await authService.logout(userId, ipAddress, userAgent);
        res.status(200).json({
            success: true,
            data: { userId },
            message: "Logout successful."
        });
    }
    catch (err) {
        next(err);
    }
}
async function getMe(req, res, next) {
    try {
        const userId = req.user.id;
        const user = await authService.getUserProfile(userId);
        res.status(200).json({
            success: true,
            data: user,
            message: "Current user profile retrieved."
        });
    }
    catch (err) {
        next(err);
    }
}
