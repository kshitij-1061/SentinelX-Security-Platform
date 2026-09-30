import { prisma } from "../config/database";

export interface CreateAuditLogDto {
  userId?: string | null;
  action: string;
  status?: string;
  resource?: string | null;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
}

export class AuditRepository {
  async create(data: CreateAuditLogDto) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        status: data.status || "SUCCESS",
        resource: data.resource || null,
        resourceId: data.resourceId || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    });
  }

  async listAll(skip = 0, take = 100) {
    const logs = await prisma.auditLog.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" }
    });

    return logs.map((log) => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }));
  }
}
