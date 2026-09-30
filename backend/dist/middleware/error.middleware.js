"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
class AppError extends Error {
    statusCode;
    code;
    constructor(message, statusCode = 400, code = "BAD_REQUEST") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}
exports.AppError = AppError;
function errorMiddleware(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let code = err.code || "INTERNAL_SERVER_ERROR";
    let message = err.message || "An unexpected server error occurred.";
    if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        code = "VALIDATION_ERROR";
        message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    }
    if (statusCode === 500) {
        console.error("[500 Error]", err);
    }
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message
        }
    });
}
