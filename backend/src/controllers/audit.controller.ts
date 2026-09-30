import { Request, Response, NextFunction } from "express";
import { AuditService } from "../services/audit.service";

const auditService = new AuditService();

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const skip = Number(req.query.skip) || 0;
    const limit = Number(req.query.limit) || 100;

    const logs = await auditService.getLogs(skip, limit);
    res.status(200).json({
      success: true,
      data: logs,
      message: "Audit logs retrieved successfully."
    });
  } catch (err) {
    next(err);
  }
}
