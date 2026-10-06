"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentRepository = void 0;
const database_1 = require("../config/database");
class IncidentRepository {
    async listIncidents(query) {
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.severity)
            where.severity = query.severity;
        if (query.assignedAnalyst)
            where.assignedAnalyst = query.assignedAnalyst;
        return database_1.prisma.incident.findMany({
            where,
            orderBy: { detectedAt: "desc" },
            include: {
                alerts: {
                    include: {
                        alert: {
                            include: { asset: true, detectionRule: true }
                        }
                    }
                },
                assets: {
                    include: { asset: true }
                },
                evidence: true,
                notes: true,
                actions: true
            }
        });
    }
    async findIncidentById(id) {
        return database_1.prisma.incident.findUnique({
            where: { id },
            include: {
                alerts: {
                    include: {
                        alert: {
                            include: { asset: true, detectionRule: true, sourceEvent: true }
                        }
                    }
                },
                assets: {
                    include: { asset: true }
                },
                evidence: { orderBy: { createdAt: "desc" } },
                notes: { orderBy: { createdAt: "desc" } },
                actions: { orderBy: { createdAt: "desc" } }
            }
        });
    }
    async createIncident(data) {
        const incident = await database_1.prisma.incident.create({
            data: {
                title: data.title,
                description: data.description,
                severity: data.severity || "HIGH",
                status: data.status || "NEW",
                confidence: data.confidence ?? 0.9,
                assignedAnalyst: data.assignedAnalyst || "Unassigned",
                correlationGroupId: data.correlationGroupId || null,
                alerts: data.alertIds && data.alertIds.length > 0 ? {
                    create: data.alertIds.map((aId) => ({ alertId: aId }))
                } : undefined,
                assets: data.assetIds && data.assetIds.length > 0 ? {
                    create: data.assetIds.map((astId) => ({ assetId: astId }))
                } : undefined
            },
            include: {
                alerts: { include: { alert: true } },
                assets: { include: { asset: true } }
            }
        });
        return this.findIncidentById(incident.id);
    }
    async updateIncident(id, data) {
        return database_1.prisma.incident.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description && { description: data.description }),
                ...(data.severity && { severity: data.severity }),
                ...(data.status && { status: data.status }),
                ...(data.assignedAnalyst && { assignedAnalyst: data.assignedAnalyst }),
                ...(data.resolution && { resolution: data.resolution }),
                ...(data.status === "RESOLVED" || data.status === "CLOSED" ? { resolvedAt: new Date() } : {})
            },
            include: {
                alerts: { include: { alert: true } },
                assets: { include: { asset: true } }
            }
        });
    }
    async addEvidence(incidentId, data, createdBy) {
        return database_1.prisma.incidentEvidence.create({
            data: {
                incidentId,
                type: data.type || "LOG_EXTRACT",
                description: data.description,
                source: data.source,
                reference: data.reference,
                createdBy
            }
        });
    }
    async addNote(incidentId, author, content) {
        return database_1.prisma.incidentNote.create({
            data: {
                incidentId,
                author,
                content
            }
        });
    }
    async recordAction(incidentId, data) {
        return database_1.prisma.incidentAction.create({
            data: {
                incidentId,
                analyst: data.analyst,
                action: data.action,
                target: data.target,
                reason: data.reason,
                result: data.result,
                mode: data.mode
            }
        });
    }
}
exports.IncidentRepository = IncidentRepository;
