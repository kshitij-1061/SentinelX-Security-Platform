import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const authService = new AuthService();

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedInput = registerSchema.parse(req.body);
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    const user = await authService.register(validatedInput, ipAddress, userAgent);
    res.status(201).json({
      success: true,
      data: user,
      message: "User registered successfully."
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedInput = loginSchema.parse(req.body);
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    const result = await authService.login(validatedInput, ipAddress, userAgent);
    res.status(200).json({
      success: true,
      data: result,
      message: "Authentication successful."
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    await authService.logout(userId, ipAddress, userAgent);
    res.status(200).json({
      success: true,
      data: { userId },
      message: "Logout successful."
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const user = await authService.getUserProfile(userId);
    res.status(200).json({
      success: true,
      data: user,
      message: "Current user profile retrieved."
    });
  } catch (err) {
    next(err);
  }
}
