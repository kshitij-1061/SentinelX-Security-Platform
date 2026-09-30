import { prisma } from "../config/database";
import { CreateHoneypotInput, UpdateHoneypotInput, IngestHoneypotEventInput } from "../schemas/honeypot.schema";

export class HoneypotRepository {
  async listHoneypots() {
    return prisma.honeypot.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { events: true, sessions: true }
        }
      }
    });
  }

  async findHoneypotById(id: string) {
    return prisma.honeypot.findUnique({
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

  async createHoneypot(data: CreateHoneypotInput) {
    return prisma.honeypot.create({
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

  async updateHoneypot(id: string, data: UpdateHoneypotInput) {
    return prisma.honeypot.update({
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

  async ingestHoneypotEvent(data: IngestHoneypotEventInput, securityEventId?: string) {
    // Sanitized: Passwords are NEVER accepted or stored
    return prisma.honeypotEvent.create({
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
    return prisma.honeypotEvent.findMany({
      take: limit,
      orderBy: { timestamp: "desc" },
      include: { honeypot: true }
    });
  }

  async getSessionsByHoneypotId(honeypotId: string) {
    return prisma.honeypotSession.findMany({
      where: { honeypotId },
      orderBy: { startedAt: "desc" }
    });
  }

  async upsertHoneypotSession(honeypotId: string, sourceIP: string) {
    const existing = await prisma.honeypotSession.findFirst({
      where: { honeypotId, sourceIP, status: "ACTIVE" }
    });

    if (existing) {
      return prisma.honeypotSession.update({
        where: { id: existing.id },
        data: { eventCount: { increment: 1 } }
      });
    }

    return prisma.honeypotSession.create({
      data: {
        honeypotId,
        sourceIP,
        status: "ACTIVE",
        eventCount: 1
      }
    });
  }
}
