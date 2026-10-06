"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreatIntelService = void 0;
const threat_intel_repository_1 = require("../../repositories/threat-intel.repository");
const audit_service_1 = require("../audit.service");
const error_middleware_1 = require("../../middleware/error.middleware");
class ThreatIntelService {
    tiRepo;
    auditService;
    constructor() {
        this.tiRepo = new threat_intel_repository_1.ThreatIntelRepository();
        this.auditService = new audit_service_1.AuditService();
    }
    async getIndicators(type) {
        return this.tiRepo.listIndicators(type);
    }
    async getIndicatorByValue(value) {
        const indicator = await this.tiRepo.findIndicatorByValue(value);
        if (!indicator) {
            throw new error_middleware_1.AppError(`Threat indicator '${value}' not found in intelligence database.`, 404, "NOT_FOUND");
        }
        return indicator;
    }
    async createIndicator(input, userId, ipAddress, userAgent) {
        const existing = await this.tiRepo.findIndicatorByValue(input.value);
        if (existing) {
            throw new error_middleware_1.AppError(`Threat indicator '${input.value}' already exists.`, 400, "DUPLICATE_INDICATOR");
        }
        const indicator = await this.tiRepo.createIndicator(input);
        await this.auditService.logEvent({
            action: "THREAT_INTEL_CREATE",
            status: "SUCCESS",
            userId,
            resource: "ThreatIndicator",
            resourceId: indicator.id,
            ipAddress,
            userAgent,
            metadata: { value: indicator.value, type: indicator.type }
        });
        return indicator;
    }
    async enrichIoc(iocValue) {
        const indicator = await this.tiRepo.findIndicatorByValue(iocValue);
        if (!indicator) {
            return {
                matched: false,
                iocValue,
                confidence: 0,
                tags: [],
                message: "No matching IOC found in intelligence repository."
            };
        }
        return {
            matched: true,
            iocValue,
            type: indicator.type,
            source: indicator.source,
            confidence: indicator.confidence,
            tags: typeof indicator.tags === "string" ? JSON.parse(indicator.tags) : indicator.tags,
            description: indicator.description
        };
    }
}
exports.ThreatIntelService = ThreatIntelService;
