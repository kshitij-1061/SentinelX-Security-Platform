"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectionEngine = void 0;
const database_1 = require("../../config/database");
const sigma_adapter_1 = require("./sigma/sigma.adapter");
class DetectionEngine {
    sigmaAdapter;
    constructor() {
        this.sigmaAdapter = new sigma_adapter_1.SigmaRuleAdapter();
    }
    async evaluateEvent(event) {
        const rules = await database_1.prisma.detectionRule.findMany({
            where: { enabled: true }
        });
        const triggeredAlerts = [];
        for (const rule of rules) {
            let matched = false;
            // 1. Source match override if rule specifies source
            if (rule.source === "HONEYPOT" && event.source === "HONEYPOT") {
                matched = true;
            }
            else {
                // 2. Evaluate rule condition logic
                matched = this.sigmaAdapter.evaluateRule(rule.ruleDefinition, event);
            }
            if (matched) {
                // Create Alert
                const alert = await database_1.prisma.alert.create({
                    data: {
                        detectionRuleId: rule.id,
                        severity: rule.severity || event.severity || "MEDIUM",
                        sourceEventId: event.id,
                        assetId: event.assetId,
                        description: `[${rule.severity}] Detection Triggered: ${rule.name} - ${rule.description}`,
                        status: "NEW",
                        confidence: 0.95,
                        mitreTechnique: rule.mitreTechnique || "T1110"
                    },
                    include: {
                        detectionRule: true,
                        sourceEvent: true,
                        asset: true
                    }
                });
                triggeredAlerts.push(alert);
            }
        }
        return triggeredAlerts;
    }
}
exports.DetectionEngine = DetectionEngine;
