"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepository = void 0;
const database_1 = require("../config/database");
class AuditRepository {
    async create(data) {
        return database_1.prisma.auditLog.create({
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
        const logs = await database_1.prisma.auditLog.findMany({
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
exports.AuditRepository = AuditRepository;
