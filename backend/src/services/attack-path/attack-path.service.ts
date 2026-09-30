import { AttackPathRepository } from "../../repositories/attack-path.repository";
import { AttackPathAnalyzer } from "./graph.analyzer";
import { AuditService } from "../audit.service";
import { AppError } from "../../middleware/error.middleware";

export class AttackPathService {
  private pathRepo: AttackPathRepository;
  private analyzer: AttackPathAnalyzer;
  private auditService: AuditService;

  constructor() {
    this.pathRepo = new AttackPathRepository();
    this.analyzer = new AttackPathAnalyzer();
    this.auditService = new AuditService();
  }

  async getAttackPaths() {
    return this.pathRepo.listAttackPaths();
  }

  async getAttackPathById(id: string) {
    const path = await this.pathRepo.findAttackPathById(id);
    if (!path) {
      throw new AppError(`Attack path with ID '${id}' not found.`, 404, "NOT_FOUND");
    }
    return path;
  }

  async getPathRiskAssessment(id: string) {
    const path = await this.getAttackPathById(id);
    return path.risks[0] || null;
  }

  async analyzeAndBuildPaths(userId?: string, ipAddress?: string, userAgent?: string) {
    const calculatedPaths = await this.analyzer.analyzePaths();

    const created = [];
    for (const p of calculatedPaths) {
      const dbPath = await this.pathRepo.createAttackPath(p);
      created.push(dbPath);
    }

    await this.auditService.logEvent({
      action: "ATTACK_PATH_ANALYZE",
      status: "SUCCESS",
      userId,
      resource: "AttackPath",
      ipAddress,
      userAgent,
      metadata: { pathsGenerated: created.length }
    });

    return created;
  }
}
