import { prisma } from "../../config/database";
import { CorrelationRepository } from "../../repositories/correlation.repository";

export class CorrelationEngine {
  private correlationRepo: CorrelationRepository;

  constructor() {
    this.correlationRepo = new CorrelationRepository();
  }

  async runCorrelation(timeWindowMinutes = 60) {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    // Fetch recent un-correlated alerts
    const alerts = await prisma.alert.findMany({
      where: {
        timestamp: { gte: cutoff },
        correlationGroupId: null
      },
      include: {
        sourceEvent: true,
        asset: true,
        detectionRule: true
      },
      orderBy: { timestamp: "asc" }
    });

    if (alerts.length < 2) return [];

    const groupedByAsset = new Map<string, any[]>();
    const groupedByIp = new Map<string, any[]>();

    for (const alert of alerts) {
      if (alert.assetId) {
        if (!groupedByAsset.has(alert.assetId)) groupedByAsset.set(alert.assetId, []);
        groupedByAsset.get(alert.assetId)!.push(alert);
      }

      const srcIp = alert.sourceEvent?.sourceIP;
      if (srcIp) {
        if (!groupedByIp.has(srcIp)) groupedByIp.set(srcIp, []);
        groupedByIp.get(srcIp)!.push(alert);
      }
    }

    const createdGroups: any[] = [];

    // Correlate by asset
    for (const [assetId, assetAlerts] of groupedByAsset.entries()) {
      if (assetAlerts.length >= 2) {
        const assetObj = assetAlerts[0].asset;
        const alertIds = assetAlerts.map((a) => a.id);
        const techniques = Array.from(new Set(assetAlerts.map((a) => a.mitreTechnique).filter(Boolean)));
        const maxSev = assetAlerts.some((a) => a.severity === "CRITICAL") ? "CRITICAL" : "HIGH";

        const group = await this.correlationRepo.createCorrelationGroup({
          name: `Correlation Group: Multi-Alert Cluster on Host '${assetObj?.hostname || assetId}'`,
          startTime: assetAlerts[0].timestamp,
          endTime: assetAlerts[assetAlerts.length - 1].timestamp,
          severity: maxSev,
          confidence: 0.90,
          reason: `Correlated ${assetAlerts.length} security alerts targeting asset '${assetObj?.hostname || assetId}' within ${timeWindowMinutes} minute window.`,
          affectedAssets: [assetId],
          mitreTechniques: techniques,
          alertIds
        });

        createdGroups.push(group);
      }
    }

    return createdGroups;
  }
}
