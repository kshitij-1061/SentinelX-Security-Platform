"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoneypotService = void 0;
const honeypot_repository_1 = require("../../repositories/honeypot.repository");
const threat_service_1 = require("../threat.service");
const audit_service_1 = require("../audit.service");
const error_middleware_1 = require("../../middleware/error.middleware");
class HoneypotService {
    hpRepo;
    threatService;
    auditService;
    constructor() {
        this.hpRepo = new honeypot_repository_1.HoneypotRepository();
        this.threatService = new threat_service_1.ThreatService();
        this.auditService = new audit_service_1.AuditService();
    }
    async getHoneypots() {
        return this.hpRepo.listHoneypots();
    }
    async getHoneypotById(id) {
        const hp = await this.hpRepo.findHoneypotById(id);
        if (!hp) {
            throw new error_middleware_1.AppError(`Honeypot with ID '${id}' not found.`, 404, "NOT_FOUND");
        }
        return hp;
    }
    async createHoneypot(input, userId, ipAddress, userAgent) {
        const hp = await this.hpRepo.createHoneypot(input);
        await this.auditService.logEvent({
            action: "HONEYPOT_CREATE",
            status: "SUCCESS",
            userId,
            resource: "Honeypot",
            resourceId: hp.id,
            ipAddress,
            userAgent,
            metadata: { name: hp.name, type: hp.type, ip: hp.ip }
        });
        return hp;
    }
    async updateHoneypot(id, input, userId, ipAddress, userAgent) {
        await this.getHoneypotById(id);
        const updated = await this.hpRepo.updateHoneypot(id, input);
        await this.auditService.logEvent({
            action: "HONEYPOT_UPDATE",
            status: "SUCCESS",
            userId,
            resource: "Honeypot",
            resourceId: id,
            ipAddress,
            userAgent,
            metadata: { input }
        });
        return updated;
    }
    async ingestHoneypotEvent(input, userId, ipAddress, userAgent) {
        const hp = await this.getHoneypotById(input.honeypotId);
        // 1. First convert into standard SecurityEvent and feed into Task 4 Detection Pipeline
        const ingested = await this.threatService.ingestEvent({
            source: "HONEYPOT",
            eventType: "HONEYPOT_INTERACTION",
            sourceIP: input.sourceIP,
            destinationIP: input.destinationIP || hp.ip,
            sourcePort: 54321,
            destinationPort: hp.port,
            protocol: input.protocol || "TCP",
            username: input.username ? input.username.substring(0, 50) : undefined,
            severity: "CRITICAL",
            rawPayload: {
                honeypotName: hp.name,
                honeypotType: hp.type,
                eventType: input.eventType,
                requestData: input.requestData,
                commandData: input.commandData
            }
        }, userId, ipAddress, userAgent);
        // 2. Persist HoneypotEvent linked to SecurityEvent ID
        const hpEvent = await this.hpRepo.ingestHoneypotEvent(input, ingested.event.id);
        // 3. Upsert Honeypot Session tracking
        await this.hpRepo.upsertHoneypotSession(hp.id, input.sourceIP);
        return {
            honeypotEvent: hpEvent,
            securityEvent: ingested.event,
            triggeredAlerts: ingested.triggeredAlerts
        };
    }
    async getHoneypotEvents(limit = 50) {
        return this.hpRepo.listHoneypotEvents(limit);
    }
    async getHoneypotSessions(id) {
        await this.getHoneypotById(id);
        return this.hpRepo.getSessionsByHoneypotId(id);
    }
}
exports.HoneypotService = HoneypotService;
