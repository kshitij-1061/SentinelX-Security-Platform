"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrelationEngine = void 0;
const database_1 = require("../../config/database");
const correlation_repository_1 = require("../../repositories/correlation.repository");
class CorrelationEngine {
    correlationRepo;
    constructor() {
        this.correlationRepo = new correlation_repository_1.CorrelationRepository();
    }
    async runCorrelation(timeWindowMinutes = 60) {
        const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
        // Fetch recent un-correlated alerts
        const alerts = await database_1.prisma.alert.findMany({
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
        if (alerts.length < 2)
            return [];
        const groupedByAsset = new Map();
        const groupedByIp = new Map();
        for (const alert of alerts) {
            if (alert.assetId) {
                if (!groupedByAsset.has(alert.assetId))
                    groupedByAsset.set(alert.assetId, []);
                groupedByAsset.get(alert.assetId).push(alert);
            }
            const srcIp = alert.sourceEvent?.sourceIP;
            if (srcIp) {
                if (!groupedByIp.has(srcIp))
                    groupedByIp.set(srcIp, []);
                groupedByIp.get(srcIp).push(alert);
            }
        }
        const createdGroups = [];
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
exports.CorrelationEngine = CorrelationEngine;
