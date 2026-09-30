"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = requirePermission;
exports.authorize = authorize;
const error_middleware_1 = require("./error.middleware");
function requirePermission(requiredPermission) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new error_middleware_1.AppError("User unauthenticated.", 401, "UNAUTHORIZED"));
        }
        const permissions = req.user.permissions || [];
        if (permissions.includes("SYSTEM_ADMIN")) {
            return next();
        }
        if (!permissions.includes(requiredPermission)) {
            return next(new error_middleware_1.AppError(`Permission '${requiredPermission}' required.`, 403, "FORBIDDEN"));
        }
        next();
    };
}
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new error_middleware_1.AppError("User unauthenticated.", 401, "UNAUTHORIZED"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new error_middleware_1.AppError(`Role '${req.user.role}' is not authorized to access this resource.`, 403, "FORBIDDEN"));
        }
        next();
    };
}
