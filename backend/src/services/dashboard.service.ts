import { prisma } from "../config/database";

export class DashboardService {
  async getSummary() {
    const [
      totalAssets,
      activeAssets,
      criticalAssets,
      vulnerableAssets,
      totalVulnerabilities,
      criticalVulnerabilities,
      activeAlerts,
      criticalAlerts,
      openIncidents,
      criticalIncidents,
      highRiskAttackPaths,
      totalHoneypotEvents,
      totalCorrelations
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: "ACTIVE" } }),
      prisma.asset.count({ where: { criticality: "CRITICAL" } }),
      prisma.asset.count({ where: { vulnerabilities: { some: {} } } }),
      prisma.vulnerability.count(),
      prisma.vulnerability.count({ where: { severity: "CRITICAL" } }),
      prisma.alert.count({ where: { status: { in: ["NEW", "ACKNOWLEDGED", "INVESTIGATING"] } } }),
      prisma.alert.count({ where: { severity: "CRITICAL" } }),
      prisma.incident.count({ where: { status: { in: ["NEW", "TRIAGED", "INVESTIGATING"] } } }),
      prisma.incident.count({ where: { severity: "CRITICAL" } }),
      prisma.attackPath.count({ where: { severity: { in: ["HIGH", "CRITICAL"] } } }),
      prisma.honeypotEvent.count(),
      prisma.correlationGroup.count()
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
    const [
      vulnerabilitiesBySeverity,
      incidentsBySeverity,
      alertsBySeverity,
      assetsByCriticality,
      assetsByType,
      mitreTechniques
    ] = await Promise.all([
      prisma.vulnerability.groupBy({ by: ["severity"], _count: { id: true } }),
      prisma.incident.groupBy({ by: ["severity"], _count: { id: true } }),
      prisma.alert.groupBy({ by: ["severity"], _count: { id: true } }),
      prisma.asset.groupBy({ by: ["criticality"], _count: { id: true } }),
      prisma.asset.groupBy({ by: ["assetType"], _count: { id: true } }),
      prisma.mitreTechnique.findMany({ take: 10 })
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

  async globalSearch(searchTerm: string) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return { assets: [], vulnerabilities: [], alerts: [], incidents: [], indicators: [] };
    }

    const term = searchTerm.trim();

    const [assets, vulnerabilities, alerts, incidents, indicators] = await Promise.all([
      prisma.asset.findMany({
        where: {
          OR: [
            { hostname: { contains: term } },
            { ipAddress: { contains: term } },
            { owner: { contains: term } }
          ]
        },
        take: 5
      }),
      prisma.vulnerability.findMany({
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
      prisma.alert.findMany({
        where: {
          OR: [
            { description: { contains: term } },
            { mitreTechnique: { contains: term } }
          ]
        },
        take: 5
      }),
      prisma.incident.findMany({
        where: {
          OR: [
            { title: { contains: term } },
            { description: { contains: term } },
            { assignedAnalyst: { contains: term } }
          ]
        },
        take: 5
      }),
      prisma.threatIndicator.findMany({
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
