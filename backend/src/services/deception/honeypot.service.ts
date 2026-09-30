import { HoneypotRepository } from "../../repositories/honeypot.repository";
import { ThreatService } from "../threat.service";
import { AuditService } from "../audit.service";
import { CreateHoneypotInput, UpdateHoneypotInput, IngestHoneypotEventInput } from "../../schemas/honeypot.schema";
import { AppError } from "../../middleware/error.middleware";

export class HoneypotService {
  private hpRepo: HoneypotRepository;
  private threatService: ThreatService;
  private auditService: AuditService;

  constructor() {
    this.hpRepo = new HoneypotRepository();
    this.threatService = new ThreatService();
    this.auditService = new AuditService();
  }

  async getHoneypots() {
    return this.hpRepo.listHoneypots();
  }

  async getHoneypotById(id: string) {
    const hp = await this.hpRepo.findHoneypotById(id);
    if (!hp) {
      throw new AppError(`Honeypot with ID '${id}' not found.`, 404, "NOT_FOUND");
    }
    return hp;
  }

  async createHoneypot(input: CreateHoneypotInput, userId?: string, ipAddress?: string, userAgent?: string) {
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

  async updateHoneypot(id: string, input: UpdateHoneypotInput, userId?: string, ipAddress?: string, userAgent?: string) {
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

  async ingestHoneypotEvent(input: IngestHoneypotEventInput, userId?: string, ipAddress?: string, userAgent?: string) {
    const hp = await this.getHoneypotById(input.honeypotId);

    // 1. First convert into standard SecurityEvent and feed into Task 4 Detection Pipeline
    const ingested = await this.threatService.ingestEvent(
      {
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
      },
      userId,
      ipAddress,
      userAgent
    );

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

  async getHoneypotSessions(id: string) {
    await this.getHoneypotById(id);
    return this.hpRepo.getSessionsByHoneypotId(id);
  }
}
