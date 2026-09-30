"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./config/env");
const index_1 = __importDefault(require("./routes/v1/index"));
const error_middleware_1 = require("./middleware/error.middleware");
const swagger_1 = require("./utils/swagger");
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [env_1.env.CORS_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
}));
// Request parsing
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// HTTP Request logging
if (env_1.env.NODE_ENV !== "test") {
    app.use((0, morgan_1.default)("combined"));
}
// Swagger API Documentation
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerDocument));
app.use("/api/v1/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerDocument));
// Root Endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Enterprise Cyber Defense & Attack Path Intelligence Platform API (Express + TypeScript)",
        docs: "/docs",
        health: "/api/v1/health"
    });
});
// Register API v1 Router
app.use("/api/v1", index_1.default);
// 404 Handler
app.use((req, res, next) => {
    next(new error_middleware_1.AppError(`Route ${req.originalUrl} not found`, 404, "NOT_FOUND"));
});
// Centralized Error Handling Middleware
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
