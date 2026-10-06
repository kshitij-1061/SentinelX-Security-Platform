"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreatService = void 0;
const threat_repository_1 = require("../repositories/threat.repository");
const asset_repository_1 = require("../repositories/asset.repository");
const audit_service_1 = require("./audit.service");
const detection_engine_1 = require("./detection/detection.engine");
const suricata_adapter_1 = require("./detection/adapters/suricata.adapter");
const zeek_adapter_1 = require("./detection/adapters/zeek.adapter");
const syslog_adapter_1 = require("./detection/adapters/syslog.adapter");
const generic_adapter_1 = require("./detection/adapters/generic.adapter");
const error_middleware_1 = require("../middleware/error.middleware");
class ThreatService {
    threatRepo;
    assetRepo;
    auditService;
    detectionEngine;
    suricataAdapter;
    zeekAdapter;
    syslogAdapter;
    genericAdapter;
    constructor() {
        this.threatRepo = new threat_repository_1.ThreatRepository();
        this.assetRepo = new asset_repository_1.AssetRepository();
        this.auditService = new audit_service_1.AuditService();
        this.detectionEngine = new detection_engine_1.DetectionEngine();
        this.suricataAdapter = new suricata_adapter_1.SuricataAdapter();
        this.zeekAdapter = new zeek_adapter_1.ZeekAdapter();
        this.syslogAdapter = new syslog_adapter_1.SyslogAdapter();
        this.genericAdapter = new generic_adapter_1.GenericJsonAdapter();
    }
    async ingestEvent(input, userId, ipAddress, userAgent) {
        let normalized;
        if (input.source === "SURICATA") {
            normalized = this.suricataAdapter.parseAndNormalize(input.rawPayload);
        }
        else if (input.source === "ZEEK") {
            normalized = this.zeekAdapter.parseAndNormalize(input.rawPayload);
        }
        else if (input.source === "SYSLOG") {
            normalized = this.syslogAdapter.parseAndNormalize(input.rawPayload);
        }
        else {
            normalized = this.genericAdapter.parseAndNormalize(input.rawPayload);
        }
        // Override adapter parsed fields with input overrides if present
        if (input.sourceIP)
            normalized.sourceIP = input.sourceIP;
        if (input.destinationIP)
            normalized.destinationIP = input.destinationIP;
        if (input.eventType)
            normalized.eventType = input.eventType;
        if (input.severity)
            normalized.severity = input.severity;
        // Resolve asset by IP
        let matchedAssetId = null;
        if (normalized.sourceIP) {
            const asset = await this.assetRepo.findByIp(normalized.sourceIP);
            if (asset)
                matchedAssetId = asset.id;
        }
        if (!matchedAssetId && normalized.destinationIP) {
            const asset = await this.assetRepo.findByIp(normalized.destinationIP);
            if (asset)
                matchedAssetId = asset.id;
        }
        const event = await this.threatRepo.createEvent({
            ...normalized,
            assetId: matchedAssetId
        });
        // Evaluate detection engine
        const triggeredAlerts = await this.detectionEngine.evaluateEvent(event);
        await this.auditService.logEvent({
            action: "EVENT_INGEST",
            status: "SUCCESS",
            userId,
            resource: "SecurityEvent",
            resourceId: event.id,
            ipAddress,
            userAgent,
            metadata: { source: event.source, eventType: event.eventType, alertsGenerated: triggeredAlerts.length }
        });
        return {
            event,
            triggeredAlerts
        };
    }
    async getEvents(query) {
        return this.threatRepo.findEventsWithFilters(query);
    }
    async getEventById(id) {
        const event = await this.threatRepo.findEventById(id);
        if (!event) {
            throw new error_middleware_1.AppError(`Security event with ID '${id}' not found.`, 404, "NOT_FOUND");
        }
        return event;
    }
    async getAlerts(query) {
        return this.threatRepo.findAlertsWithFilters(query);
    }
    async getAlertById(id) {
        const alert = await this.threatRepo.findAlertById(id);
        if (!alert) {
            throw new error_middleware_1.AppError(`Alert with ID '${id}' not found.`, 404, "NOT_FOUND");
        }
        return alert;
    }
    async updateAlertStatus(id, status, userId, ipAddress, userAgent) {
        await this.getAlertById(id);
        const updated = await this.threatRepo.updateAlertStatus(id, status);
        await this.auditService.logEvent({
            action: "ALERT_STATUS_UPDATE",
            status: "SUCCESS",
            userId,
            resource: "Alert",
            resourceId: id,
            ipAddress,
            userAgent,
            metadata: { status }
        });
        return updated;
    }
    async getDetectionRules() {
        return this.threatRepo.listDetectionRules();
    }
    async createDetectionRule(input, userId, ipAddress, userAgent) {
        const rule = await this.threatRepo.createDetectionRule(input);
        await this.auditService.logEvent({
            action: "DETECTION_RULE_CREATE",
            status: "SUCCESS",
            userId,
            resource: "DetectionRule",
            resourceId: rule.id,
            ipAddress,
            userAgent,
            metadata: { name: rule.name, severity: rule.severity }
        });
        return rule;
    }
    async updateDetectionRule(id, input, userId, ipAddress, userAgent) {
        const rule = await this.threatRepo.updateDetectionRule(id, input);
        await this.auditService.logEvent({
            action: "DETECTION_RULE_UPDATE",
            status: "SUCCESS",
            userId,
            resource: "DetectionRule",
            resourceId: id,
            ipAddress,
            userAgent,
            metadata: { input }
        });
        return rule;
    }
}
exports.ThreatService = ThreatService;
