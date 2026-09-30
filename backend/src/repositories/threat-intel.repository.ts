import { prisma } from "../config/database";
import { CreateThreatIndicatorInput, UpdateThreatIndicatorInput } from "../schemas/correlation.schema";

export class ThreatIntelRepository {
  async listIndicators(type?: string) {
    const where: any = {};
    if (type) where.type = type;

    return prisma.threatIndicator.findMany({
      where,
      orderBy: { lastSeen: "desc" }
    });
  }

  async findIndicatorByValue(value: string) {
    return prisma.threatIndicator.findUnique({
      where: { value }
    });
  }

  async createIndicator(data: CreateThreatIndicatorInput) {
    return prisma.threatIndicator.create({
      data: {
        type: data.type,
        value: data.value,
        source: data.source || "MANUAL",
        confidence: data.confidence ?? 0.9,
        tags: JSON.stringify(data.tags || []),
        description: data.description
      }
    });
  }

  async listMitreTechniques() {
    return prisma.mitreTechnique.findMany({
      orderBy: { techniqueId: "asc" }
    });
  }

  async findMitreTechniqueById(techniqueId: string) {
    return prisma.mitreTechnique.findUnique({
      where: { techniqueId }
    });
  }
}
