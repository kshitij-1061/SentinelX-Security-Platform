import { prisma } from "../config/database";
import { CreateIncidentInput, UpdateIncidentInput, AddEvidenceInput, AddNoteInput, ExecuteResponseActionInput } from "../schemas/incident.schema";

export class IncidentRepository {
  async listIncidents(query: { status?: string; severity?: string; assignedAnalyst?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.severity) where.severity = query.severity;
    if (query.assignedAnalyst) where.assignedAnalyst = query.assignedAnalyst;

    return prisma.incident.findMany({
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

  async findIncidentById(id: string) {
    return prisma.incident.findUnique({
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

  async createIncident(data: CreateIncidentInput) {
    const incident = await prisma.incident.create({
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

  async updateIncident(id: string, data: UpdateIncidentInput) {
    return prisma.incident.update({
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

  async addEvidence(incidentId: string, data: AddEvidenceInput, createdBy: string) {
    return prisma.incidentEvidence.create({
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

  async addNote(incidentId: string, author: string, content: string) {
    return prisma.incidentNote.create({
      data: {
        incidentId,
        author,
        content
      }
    });
  }

  async recordAction(incidentId: string, data: {
    analyst: string;
    action: string;
    target: string;
    reason: string;
    result: string;
    mode: string;
  }) {
    return prisma.incidentAction.create({
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
