"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttackPathService = void 0;
const attack_path_repository_1 = require("../../repositories/attack-path.repository");
const graph_analyzer_1 = require("./graph.analyzer");
const audit_service_1 = require("../audit.service");
const error_middleware_1 = require("../../middleware/error.middleware");
class AttackPathService {
    pathRepo;
    analyzer;
    auditService;
    constructor() {
        this.pathRepo = new attack_path_repository_1.AttackPathRepository();
        this.analyzer = new graph_analyzer_1.AttackPathAnalyzer();
        this.auditService = new audit_service_1.AuditService();
    }
    async getAttackPaths() {
        return this.pathRepo.listAttackPaths();
    }
    async getAttackPathById(id) {
        const path = await this.pathRepo.findAttackPathById(id);
        if (!path) {
            throw new error_middleware_1.AppError(`Attack path with ID '${id}' not found.`, 404, "NOT_FOUND");
        }
        return path;
    }
    async getPathRiskAssessment(id) {
        const path = await this.getAttackPathById(id);
        return path.risks[0] || null;
    }
    async analyzeAndBuildPaths(userId, ipAddress, userAgent) {
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
exports.AttackPathService = AttackPathService;
