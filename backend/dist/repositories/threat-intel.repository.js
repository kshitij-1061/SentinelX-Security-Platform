"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreatIntelRepository = void 0;
const database_1 = require("../config/database");
class ThreatIntelRepository {
    async listIndicators(type) {
        const where = {};
        if (type)
            where.type = type;
        return database_1.prisma.threatIndicator.findMany({
            where,
            orderBy: { lastSeen: "desc" }
        });
    }
    async findIndicatorByValue(value) {
        return database_1.prisma.threatIndicator.findUnique({
            where: { value }
        });
    }
    async createIndicator(data) {
        return database_1.prisma.threatIndicator.create({
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
        return database_1.prisma.mitreTechnique.findMany({
            orderBy: { techniqueId: "asc" }
        });
    }
    async findMitreTechniqueById(techniqueId) {
        return database_1.prisma.mitreTechnique.findUnique({
            where: { techniqueId }
        });
    }
}
exports.ThreatIntelRepository = ThreatIntelRepository;
