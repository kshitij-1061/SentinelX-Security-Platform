import { prisma } from "../config/database";
import { CreateAttackPathInput } from "../schemas/attack-path.schema";

export class AttackPathRepository {
  async listAttackPaths() {
    return prisma.attackPath.findMany({
      orderBy: { riskScore: "desc" },
      include: {
        nodes: {
          include: { asset: true },
          orderBy: { stepIndex: "asc" }
        },
        edges: true,
        risks: true
      }
    });
  }

  async findAttackPathById(id: string) {
    return prisma.attackPath.findUnique({
      where: { id },
      include: {
        nodes: {
          include: { asset: true },
          orderBy: { stepIndex: "asc" }
        },
        edges: true,
        risks: true
      }
    });
  }

  async createAttackPath(data: any) {
    return prisma.attackPath.create({
      data: {
        name: data.name || data.pathName || "Potential Attack Path",
        description: data.description,
        startNodeId: data.startNodeLabel || "Internet",
        targetNodeId: data.targetNodeLabel || "Target",
        severity: data.severity || "HIGH",
        riskScore: data.riskScore || 75.0,
        pathLength: data.pathLength || 3,
        nodes: {
          create: data.nodes.map((n: any) => ({
            assetId: n.assetId || null,
            nodeType: n.nodeType || "ASSET",
            label: n.label,
            stepIndex: n.stepIndex,
            metadata: n.metadata ? JSON.stringify(n.metadata) : null
          }))
        },
        risks: {
          create: {
            riskScore: data.riskScore || 75.0,
            riskGrade: data.severity || "HIGH",
            criticalityFactor: data.explanation?.criticalityFactor || 1.5,
            vulnerabilityFactor: data.explanation?.vulnerabilityFactor || 1.3,
            exposureFactor: data.explanation?.exposureFactor || 1.4,
            alertEvidenceFactor: data.explanation?.alertEvidenceFactor || 1.2,
            explanation: JSON.stringify(data.explanation || {})
          }
        }
      },
      include: {
        nodes: true,
        edges: true,
        risks: true
      }
    });
  }
}
