"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const database_1 = require("../config/database");
class DashboardService {
    async getSummary() {
        const [totalAssets, activeAssets, criticalAssets, vulnerableAssets, totalVulnerabilities, criticalVulnerabilities, activeAlerts, criticalAlerts, openIncidents, criticalIncidents, highRiskAttackPaths, totalHoneypotEvents, totalCorrelations] = await Promise.all([
            database_1.prisma.asset.count(),
            database_1.prisma.asset.count({ where: { status: "ACTIVE" } }),
            database_1.prisma.asset.count({ where: { criticality: "CRITICAL" } }),
            database_1.prisma.asset.count({ where: { vulnerabilities: { some: {} } } }),
            database_1.prisma.vulnerability.count(),
            database_1.prisma.vulnerability.count({ where: { severity: "CRITICAL" } }),
            database_1.prisma.alert.count({ where: { status: { in: ["NEW", "ACKNOWLEDGED", "INVESTIGATING"] } } }),
            database_1.prisma.alert.count({ where: { severity: "CRITICAL" } }),
            database_1.prisma.incident.count({ where: { status: { in: ["NEW", "TRIAGED", "INVESTIGATING"] } } }),
            database_1.prisma.incident.count({ where: { severity: "CRITICAL" } }),
            database_1.prisma.attackPath.count({ where: { severity: { in: ["HIGH", "CRITICAL"] } } }),
            database_1.prisma.honeypotEvent.count(),
            database_1.prisma.correlationGroup.count()
        ]);
        return {
            assets: { total: totalAssets, active: activeAssets, critical: criticalAssets, vulnerable: vulnerableAssets },
            vulnerabilities: { total: totalVulnerabilities, critical: criticalVulnerabilities },
            alerts: { active: activeAlerts, critical: criticalAlerts },
            incidents: { open: openIncidents, critical: criticalIncidents },
            attackPaths: { highRisk: highRiskAttackPaths },
            honeypots: { totalEvents: totalHoneypotEvents },
            correlations: { total: totalCorrelations }
        };
    }
    async getAnalytics() {
        const [vulnerabilitiesBySeverity, incidentsBySeverity, alertsBySeverity, assetsByCriticality, assetsByType, mitreTechniques] = await Promise.all([
            database_1.prisma.vulnerability.groupBy({ by: ["severity"], _count: { id: true } }),
            database_1.prisma.incident.groupBy({ by: ["severity"], _count: { id: true } }),
            database_1.prisma.alert.groupBy({ by: ["severity"], _count: { id: true } }),
            database_1.prisma.asset.groupBy({ by: ["criticality"], _count: { id: true } }),
            database_1.prisma.asset.groupBy({ by: ["assetType"], _count: { id: true } }),
            database_1.prisma.mitreTechnique.findMany({ take: 10 })
        ]);
        // Format time-series placeholder / aggregated counts for Recharts frontend rendering
        return {
            vulnerabilitiesBySeverity: vulnerabilitiesBySeverity.map((v) => ({ severity: v.severity, count: v._count.id })),
            incidentsBySeverity: incidentsBySeverity.map((i) => ({ severity: i.severity, count: i._count.id })),
            alertsBySeverity: alertsBySeverity.map((a) => ({ severity: a.severity, count: a._count.id })),
            assetsByCriticality: assetsByCriticality.map((ast) => ({ criticality: ast.criticality, count: ast._count.id })),
            assetsByType: assetsByType.map((ast) => ({ assetType: ast.assetType, count: ast._count.id })),
            mitreTechniques
        };
    }
    async globalSearch(searchTerm) {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return { assets: [], vulnerabilities: [], alerts: [], incidents: [], indicators: [] };
        }
        const term = searchTerm.trim();
        const [assets, vulnerabilities, alerts, incidents, indicators] = await Promise.all([
            database_1.prisma.asset.findMany({
                where: {
                    OR: [
                        { hostname: { contains: term } },
                        { ipAddress: { contains: term } },
                        { owner: { contains: term } }
                    ]
                },
                take: 5
            }),
            database_1.prisma.vulnerability.findMany({
                where: {
                    OR: [
                        { cve: { contains: term } },
                        { vulnerabilityIdentifier: { contains: term } },
                        { title: { contains: term } },
                        { affectedSoftware: { contains: term } }
                    ]
                },
                take: 5
            }),
            database_1.prisma.alert.findMany({
                where: {
                    OR: [
                        { description: { contains: term } },
                        { mitreTechnique: { contains: term } }
                    ]
                },
                take: 5
            }),
            database_1.prisma.incident.findMany({
                where: {
                    OR: [
                        { title: { contains: term } },
                        { description: { contains: term } },
                        { assignedAnalyst: { contains: term } }
                    ]
                },
                take: 5
            }),
            database_1.prisma.threatIndicator.findMany({
                where: {
                    OR: [
                        { value: { contains: term } },
                        { description: { contains: term } }
                    ]
                },
                take: 5
            })
        ]);
        return {
            assets,
            vulnerabilities,
            alerts,
            incidents,
            indicators
        };
    }
}
exports.DashboardService = DashboardService;
