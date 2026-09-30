import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 400, code = "BAD_REQUEST") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_SERVER_ERROR";
  let message = err.message || "An unexpected server error occurred.";

  if (err instanceof ZodError) {
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
