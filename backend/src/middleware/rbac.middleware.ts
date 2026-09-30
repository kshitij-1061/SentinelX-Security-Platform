import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";

export function requirePermission(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User unauthenticated.", 401, "UNAUTHORIZED"));
    }

    const permissions = req.user.permissions || [];
    if (permissions.includes("SYSTEM_ADMIN")) {
      return next();
    }

    if (!permissions.includes(requiredPermission)) {
      return next(new AppError(`Permission '${requiredPermission}' required.`, 403, "FORBIDDEN"));
    }

    next();
  };
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User unauthenticated.", 401, "UNAUTHORIZED"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Role '${req.user.role}' is not authorized to access this resource.`, 403, "FORBIDDEN"));
    }

    next();
  };
}
