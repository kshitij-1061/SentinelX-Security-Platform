import { prisma } from "../config/database";

export class CorrelationRepository {
  async listCorrelations(limit = 50) {
    return prisma.correlationGroup.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        alerts: {
          include: {
            asset: true,
            detectionRule: true
          }
        },
        incidents: true
      }
    });
  }

  async findCorrelationById(id: string) {
    return prisma.correlationGroup.findUnique({
      where: { id },
      include: {
        alerts: {
          include: {
            asset: true,
            sourceEvent: true,
            detectionRule: true
          }
        },
        incidents: true
      }
    });
  }

  async createCorrelationGroup(data: {
    name: string;
    startTime: Date;
    endTime: Date;
    severity: string;
    confidence: number;
    reason: string;
    affectedAssets: string[];
    mitreTechniques: string[];
    alertIds: string[];
  }) {
    const group = await prisma.correlationGroup.create({
      data: {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        severity: data.severity,
        confidence: data.confidence,
        reason: data.reason,
        affectedAssets: JSON.stringify(data.affectedAssets),
        mitreTechniques: JSON.stringify(data.mitreTechniques)
      }
    });

    if (data.alertIds && data.alertIds.length > 0) {
      await prisma.alert.updateMany({
        where: { id: { in: data.alertIds } },
        data: { correlationGroupId: group.id }
      });
    }

    return this.findCorrelationById(group.id);
  }
}
