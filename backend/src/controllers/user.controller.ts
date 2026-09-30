import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/user.repository";

const userRepo = new UserRepository();

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const skip = Number(req.query.skip) || 0;
    const limit = Number(req.query.limit) || 100;

    const users = await userRepo.listAll(skip, limit);
    res.status(200).json({
      success: true,
      data: users,
      message: "Users list retrieved successfully."
    });
  } catch (err) {
    next(err);
  }
}
