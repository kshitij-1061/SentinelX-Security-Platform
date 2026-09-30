import { ThreatRepository } from "../repositories/threat.repository";
import { AssetRepository } from "../repositories/asset.repository";
import { AuditService } from "./audit.service";
import { DetectionEngine } from "./detection/detection.engine";
import { SuricataAdapter } from "./detection/adapters/suricata.adapter";
import { ZeekAdapter } from "./detection/adapters/zeek.adapter";
import { SyslogAdapter } from "./detection/adapters/syslog.adapter";
import { GenericJsonAdapter } from "./detection/adapters/generic.adapter";
import { CreateEventInput, EventQueryInput, AlertQueryInput, CreateDetectionRuleInput } from "../schemas/threat.schema";
import { AppError } from "../middleware/error.middleware";

export class ThreatService {
  private threatRepo: ThreatRepository;
  private assetRepo: AssetRepository;
  private auditService: AuditService;
  private detectionEngine: DetectionEngine;

  private suricataAdapter: SuricataAdapter;
  private zeekAdapter: ZeekAdapter;
  private syslogAdapter: SyslogAdapter;
  private genericAdapter: GenericJsonAdapter;

  constructor() {
    this.threatRepo = new ThreatRepository();
    this.assetRepo = new AssetRepository();
    this.auditService = new AuditService();
    this.detectionEngine = new DetectionEngine();

    this.suricataAdapter = new SuricataAdapter();
    this.zeekAdapter = new ZeekAdapter();
    this.syslogAdapter = new SyslogAdapter();
    this.genericAdapter = new GenericJsonAdapter();
  }

  async ingestEvent(input: CreateEventInput, userId?: string, ipAddress?: string, userAgent?: string) {
    let normalized;
    if (input.source === "SURICATA") {
      normalized = this.suricataAdapter.parseAndNormalize(input.rawPayload);
    } else if (input.source === "ZEEK") {
      normalized = this.zeekAdapter.parseAndNormalize(input.rawPayload);
    } else if (input.source === "SYSLOG") {
      normalized = this.syslogAdapter.parseAndNormalize(input.rawPayload);
    } else {
      normalized = this.genericAdapter.parseAndNormalize(input.rawPayload);
    }

    // Override adapter parsed fields with input overrides if present
    if (input.sourceIP) normalized.sourceIP = input.sourceIP;
    if (input.destinationIP) normalized.destinationIP = input.destinationIP;
    if (input.eventType) normalized.eventType = input.eventType;
    if (input.severity) normalized.severity = input.severity;

    // Resolve asset by IP
    let matchedAssetId = null;
    if (normalized.sourceIP) {
      const asset = await this.assetRepo.findByIp(normalized.sourceIP);
      if (asset) matchedAssetId = asset.id;
    }
    if (!matchedAssetId && normalized.destinationIP) {
      const asset = await this.assetRepo.findByIp(normalized.destinationIP);
      if (asset) matchedAssetId = asset.id;
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

  async getEvents(query: EventQueryInput) {
    return this.threatRepo.findEventsWithFilters(query);
  }

  async getEventById(id: string) {
    const event = await this.threatRepo.findEventById(id);
    if (!event) {
      throw new AppError(`Security event with ID '${id}' not found.`, 404, "NOT_FOUND");
    }
    return event;
  }

  async getAlerts(query: AlertQueryInput) {
    return this.threatRepo.findAlertsWithFilters(query);
  }

  async getAlertById(id: string) {
    const alert = await this.threatRepo.findAlertById(id);
    if (!alert) {
      throw new AppError(`Alert with ID '${id}' not found.`, 404, "NOT_FOUND");
    }
    return alert;
  }

  async updateAlertStatus(id: string, status: string, userId?: string, ipAddress?: string, userAgent?: string) {
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

  async createDetectionRule(input: CreateDetectionRuleInput, userId?: string, ipAddress?: string, userAgent?: string) {
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

  async updateDetectionRule(id: string, input: Partial<CreateDetectionRuleInput>, userId?: string, ipAddress?: string, userAgent?: string) {
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
