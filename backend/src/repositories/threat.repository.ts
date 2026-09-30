import { prisma } from "../config/database";
import { CreateEventInput, EventQueryInput, AlertQueryInput, CreateDetectionRuleInput } from "../schemas/threat.schema";

export class ThreatRepository {
  async createEvent(data: any) {
    return prisma.securityEvent.create({
      data: {
        source: data.source || "GENERIC_JSON",
        eventType: data.eventType || "SECURITY_EVENT",
        timestamp: data.timestamp || new Date(),
        sourceIP: data.sourceIP || null,
        destinationIP: data.destinationIP || null,
        sourcePort: data.sourcePort || null,
        destinationPort: data.destinationPort || null,
        protocol: data.protocol || "TCP",
        username: data.username || null,
        hostname: data.hostname || null,
        process: data.process || null,
        command: data.command || null,
        rawEvent: data.rawEvent,
        normalizedFields: data.normalizedFields ? JSON.stringify(data.normalizedFields) : null,
        severity: data.severity || "LOW",
        assetId: data.assetId || null
      },
      include: {
        asset: true
      }
    });
  }

  async findEventsWithFilters(query: EventQueryInput) {
    const { page = 1, limit = 10, source, severity, sourceIP, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (source) where.source = source;
    if (severity) where.severity = severity;
    if (sourceIP) where.sourceIP = { contains: sourceIP };
    if (search) {
      where.OR = [
        { eventType: { contains: search } },
        { rawEvent: { contains: search } },
        { sourceIP: { contains: search } },
        { destinationIP: { contains: search } }
      ];
    }

    const [total, events] = await Promise.all([
      prisma.securityEvent.count({ where }),
      prisma.securityEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: { asset: true }
      })
    ]);

    return {
      events,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async findEventById(id: string) {
    return prisma.securityEvent.findUnique({
      where: { id },
      include: { asset: true, alerts: true }
    });
  }

  async findAlertsWithFilters(query: AlertQueryInput) {
    const { page = 1, limit = 10, severity, status, mitreTechnique, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (mitreTechnique) where.mitreTechnique = mitreTechnique;
    if (search) {
      where.OR = [
        { description: { contains: search } },
        { mitreTechnique: { contains: search } }
      ];
    }

    const [total, alerts] = await Promise.all([
      prisma.alert.count({ where }),
      prisma.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
          detectionRule: true,
          sourceEvent: true,
          asset: true
        }
      })
    ]);

    return {
      alerts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async findAlertById(id: string) {
    return prisma.alert.findUnique({
      where: { id },
      include: {
        detectionRule: true,
        sourceEvent: true,
        asset: true,
        incidents: true
      }
    });
  }

  async updateAlertStatus(id: string, status: string) {
    return prisma.alert.update({
      where: { id },
      data: { status },
      include: { detectionRule: true, asset: true }
    });
  }

  async listDetectionRules() {
    return prisma.detectionRule.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  async createDetectionRule(data: CreateDetectionRuleInput) {
    return prisma.detectionRule.create({
      data: {
        name: data.name,
        description: data.description,
        severity: data.severity || "MEDIUM",
        source: data.source || "CUSTOM",
        ruleDefinition: typeof data.ruleDefinition === "string" ? data.ruleDefinition : JSON.stringify(data.ruleDefinition),
        enabled: data.enabled ?? true,
        mitreTechnique: data.mitreTechnique || null
      }
    });
  }

  async updateDetectionRule(id: string, data: Partial<CreateDetectionRuleInput>) {
    return prisma.detectionRule.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.severity && { severity: data.severity }),
        ...(data.ruleDefinition && { ruleDefinition: typeof data.ruleDefinition === "string" ? data.ruleDefinition : JSON.stringify(data.ruleDefinition) }),
        ...(data.enabled !== undefined && { enabled: data.enabled }),
        ...(data.mitreTechnique !== undefined && { mitreTechnique: data.mitreTechnique })
      }
    });
  }
}
