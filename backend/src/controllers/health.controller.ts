import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export async function healthCheck(req: Request, res: Response, next: NextFunction) {
  let dbStatus = "healthy";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: any) {
    dbStatus = `unhealthy: ${err.message}`;
  }

  res.status(200).json({
    success: true,
    data: {
      status: "online",
      database: dbStatus,
      service: "Enterprise Cyber Defense & Attack Path Intelligence Platform Backend (Node/Express)",
      version: "1.0.0"
    },
    message: "System health check successful"
  });
}
