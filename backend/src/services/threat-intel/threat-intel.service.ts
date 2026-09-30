import { ThreatIntelRepository } from "../../repositories/threat-intel.repository";
import { AuditService } from "../audit.service";
import { CreateThreatIndicatorInput } from "../../schemas/correlation.schema";
import { AppError } from "../../middleware/error.middleware";

export class ThreatIntelService {
  private tiRepo: ThreatIntelRepository;
  private auditService: AuditService;

  constructor() {
    this.tiRepo = new ThreatIntelRepository();
    this.auditService = new AuditService();
  }

  async getIndicators(type?: string) {
    return this.tiRepo.listIndicators(type);
  }

  async getIndicatorByValue(value: string) {
    const indicator = await this.tiRepo.findIndicatorByValue(value);
    if (!indicator) {
      throw new AppError(`Threat indicator '${value}' not found in intelligence database.`, 404, "NOT_FOUND");
    }
    return indicator;
  }

  async createIndicator(input: CreateThreatIndicatorInput, userId?: string, ipAddress?: string, userAgent?: string) {
    const existing = await this.tiRepo.findIndicatorByValue(input.value);
    if (existing) {
      throw new AppError(`Threat indicator '${input.value}' already exists.`, 400, "DUPLICATE_INDICATOR");
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

  async enrichIoc(iocValue: string) {
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
