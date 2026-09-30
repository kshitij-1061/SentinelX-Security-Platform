import { prisma } from "../../config/database";
import { NormalizedEventData } from "./adapters/adapter.interface";
import { SigmaRuleAdapter } from "./sigma/sigma.adapter";

export class DetectionEngine {
  private sigmaAdapter: SigmaRuleAdapter;

  constructor() {
    this.sigmaAdapter = new SigmaRuleAdapter();
  }

  async evaluateEvent(event: any): Promise<any[]> {
    const rules = await prisma.detectionRule.findMany({
      where: { enabled: true }
    });

    const triggeredAlerts: any[] = [];

    for (const rule of rules) {
      let matched = false;

      // 1. Source match override if rule specifies source
      if (rule.source === "HONEYPOT" && event.source === "HONEYPOT") {
        matched = true;
      } else {
        // 2. Evaluate rule condition logic
        matched = this.sigmaAdapter.evaluateRule(rule.ruleDefinition, event);
      }

      if (matched) {
        // Create Alert
        const alert = await prisma.alert.create({
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
