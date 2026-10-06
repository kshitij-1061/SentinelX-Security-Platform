"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrelationRepository = void 0;
const database_1 = require("../config/database");
class CorrelationRepository {
    async listCorrelations(limit = 50) {
        return database_1.prisma.correlationGroup.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                alerts: {
                    include: {
                        asset: true,
                        detectionRule: true
                    }
                },
                incidents: true
            }
        });
    }
    async findCorrelationById(id) {
        return database_1.prisma.correlationGroup.findUnique({
            where: { id },
            include: {
                alerts: {
                    include: {
                        asset: true,
                        sourceEvent: true,
                        detectionRule: true
                    }
                },
                incidents: true
            }
        });
    }
    async createCorrelationGroup(data) {
        const group = await database_1.prisma.correlationGroup.create({
            data: {
                name: data.name,
                startTime: data.startTime,
                endTime: data.endTime,
                severity: data.severity,
                confidence: data.confidence,
                reason: data.reason,
                affectedAssets: JSON.stringify(data.affectedAssets),
                mitreTechniques: JSON.stringify(data.mitreTechniques)
            }
        });
        if (data.alertIds && data.alertIds.length > 0) {
            await database_1.prisma.alert.updateMany({
                where: { id: { in: data.alertIds } },
                data: { correlationGroupId: group.id }
            });
        }
        return this.findCorrelationById(group.id);
    }
}
exports.CorrelationRepository = CorrelationRepository;
