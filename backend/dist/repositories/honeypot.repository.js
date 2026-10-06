"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoneypotRepository = void 0;
const database_1 = require("../config/database");
class HoneypotRepository {
    async listHoneypots() {
        return database_1.prisma.honeypot.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { events: true, sessions: true }
                }
            }
        });
    }
    async findHoneypotById(id) {
        return database_1.prisma.honeypot.findUnique({
            where: { id },
            include: {
                events: {
                    take: 20,
                    orderBy: { timestamp: "desc" }
                },
                sessions: {
                    take: 20,
                    orderBy: { startedAt: "desc" }
                }
            }
        });
    }
    async createHoneypot(data) {
        return database_1.prisma.honeypot.create({
            data: {
                name: data.name,
                type: data.type || "SSH",
                hostname: data.hostname,
                ip: data.ip,
                port: data.port,
                status: data.status || "ACTIVE",
                description: data.description
            }
        });
    }
    async updateHoneypot(id, data) {
        return database_1.prisma.honeypot.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.type && { type: data.type }),
                ...(data.hostname && { hostname: data.hostname }),
                ...(data.ip && { ip: data.ip }),
                ...(data.port && { port: data.port }),
                ...(data.status && { status: data.status }),
                ...(data.description && { description: data.description })
            }
        });
    }
    async ingestHoneypotEvent(data, securityEventId) {
        // Sanitized: Passwords are NEVER accepted or stored
        return database_1.prisma.honeypotEvent.create({
            data: {
                honeypotId: data.honeypotId,
                sourceIP: data.sourceIP,
                destinationIP: data.destinationIP || "192.168.1.250",
                protocol: data.protocol || "TCP",
                service: data.service || "SSH",
                username: data.username ? data.username.substring(0, 50) : null,
                sessionId: data.sessionId || `session-${Date.now()}`,
                eventType: data.eventType || "PROBE",
                requestData: data.requestData || null,
                commandData: data.commandData || null,
                rawEvent: JSON.stringify({ sourceIP: data.sourceIP, eventType: data.eventType, username: data.username }),
                securityEventId
            },
            include: {
                honeypot: true
            }
        });
    }
    async listHoneypotEvents(limit = 50) {
        return database_1.prisma.honeypotEvent.findMany({
            take: limit,
            orderBy: { timestamp: "desc" },
            include: { honeypot: true }
        });
    }
    async getSessionsByHoneypotId(honeypotId) {
        return database_1.prisma.honeypotSession.findMany({
            where: { honeypotId },
            orderBy: { startedAt: "desc" }
        });
    }
    async upsertHoneypotSession(honeypotId, sourceIP) {
        const existing = await database_1.prisma.honeypotSession.findFirst({
            where: { honeypotId, sourceIP, status: "ACTIVE" }
        });
        if (existing) {
            return database_1.prisma.honeypotSession.update({
                where: { id: existing.id },
                data: { eventCount: { increment: 1 } }
            });
        }
        return database_1.prisma.honeypotSession.create({
            data: {
                honeypotId,
                sourceIP,
                status: "ACTIVE",
                eventCount: 1
            }
        });
    }
}
exports.HoneypotRepository = HoneypotRepository;
