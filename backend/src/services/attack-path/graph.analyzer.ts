import { prisma } from "../../config/database";

export interface PathAnalysisResult {
  pathName: string;
  description: string;
  startNodeLabel: string;
  targetNodeLabel: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  riskScore: number;
  pathLength: number;
  nodes: {
    label: string;
    nodeType: "INTERNET" | "ASSET" | "SERVICE" | "USER" | "CRITICAL_DATA";
    assetId?: string;
    stepIndex: number;
    metadata?: any;
  }[];
  edges: {
    sourceStep: number;
    targetStep: number;
    edgeType: "NETWORK_CONNECTIVITY" | "TRUST_RELATIONSHIP" | "VULNERABLE_EXPOSURE" | "PRIVILEGE_ACCESS";
    description: string;
    weight: number;
  }[];
  explanation: {
    riskGrade: string;
    criticalityFactor: number;
    vulnerabilityFactor: number;
    exposureFactor: number;
    alertEvidenceFactor: number;
    reason: string;
  };
}

export class AttackPathAnalyzer {
  async analyzePaths(): Promise<PathAnalysisResult[]> {
    const assets = await prisma.asset.findMany({
      include: {
        services: true,
        software: true,
        vulnerabilities: {
          include: {
            vulnerability: true
          }
        },
        alerts: true
      }
    });

    if (assets.length === 0) return [];

    // Find external facing / internet entry assets
    const externalAssets = assets.filter(
      (a) => a.vulnerabilities.some((v) => v.exposure === "EXTERNAL_FACING" || v.exposure === "DMZ") || a.environment === "DMZ"
    );

    const entryAssets = externalAssets.length > 0 ? externalAssets : [assets[0]];

    // Find target high-criticality or database assets
    const criticalTargets = assets.filter(
      (a) => a.criticality === "CRITICAL" || a.assetType === "DATABASE" || a.environment === "PRODUCTION"
    );

    const targetAssets = criticalTargets.length > 0 ? criticalTargets : [assets[assets.length - 1]];

    const pathResults: PathAnalysisResult[] = [];

    for (const entry of entryAssets) {
      for (const target of targetAssets) {
        if (entry.id === target.id && assets.length > 1) continue;

        const vulnCount = entry.vulnerabilities.length + target.vulnerabilities.length;
        const maxCvss = Math.max(
          ...entry.vulnerabilities.map((v) => v.vulnerability.cvssScore),
          ...target.vulnerabilities.map((v) => v.vulnerability.cvssScore),
          5.0
        );

        const alertEvidenceCount = entry.alerts.length + target.alerts.length;

        // Calculate deterministic risk factors
        const criticalityFactor = target.criticality === "CRITICAL" ? 1.5 : 1.2;
        const vulnerabilityFactor = maxCvss >= 9.0 ? 1.5 : maxCvss >= 7.0 ? 1.3 : 1.0;
        const exposureFactor = entry.vulnerabilities.some((v) => v.exposure === "EXTERNAL_FACING") ? 1.5 : 1.2;
        const alertEvidenceFactor = alertEvidenceCount > 0 ? 1.4 : 1.0;

        const rawScore = (maxCvss * 10 * criticalityFactor * exposureFactor * vulnerabilityFactor * alertEvidenceFactor) / 2.5;
        const riskScore = Math.min(100, Math.max(10, Math.round(rawScore * 10) / 10));

        let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";
        if (riskScore >= 80) severity = "CRITICAL";
        else if (riskScore >= 60) severity = "HIGH";

        pathResults.push({
          pathName: `Potential Path: External Internet -> ${entry.hostname} -> ${target.hostname}`,
          description: `Deterministic attack topology mapping external entry point '${entry.hostname}' (${entry.ipAddress}) to high-value target '${target.hostname}' (${target.ipAddress}).`,
          startNodeLabel: "Public Internet (RFC 1918 Lab Gateway)",
          targetNodeLabel: `${target.hostname} (${target.assetType})`,
          severity,
          riskScore,
          pathLength: 3,
          nodes: [
            { label: "Public Internet", nodeType: "INTERNET", stepIndex: 0 },
            { label: `${entry.hostname} (${entry.ipAddress})`, nodeType: "ASSET", assetId: entry.id, stepIndex: 1, metadata: { environment: entry.environment, vulnerabilities: entry.vulnerabilities.length } },
            { label: `${target.hostname} (${target.ipAddress})`, nodeType: "ASSET", assetId: target.id, stepIndex: 2, metadata: { criticality: target.criticality, assetType: target.assetType } }
          ],
          edges: [
            { sourceStep: 0, targetStep: 1, edgeType: "VULNERABLE_EXPOSURE", description: `External facing exposure on port ${entry.services[0]?.port || 80}`, weight: 1.5 },
            { sourceStep: 1, targetStep: 2, edgeType: "PRIVILEGE_ACCESS", description: "Internal lateral movement & trusted network link", weight: 1.2 }
          ],
          explanation: {
            riskGrade: severity,
            criticalityFactor,
            vulnerabilityFactor,
            exposureFactor,
            alertEvidenceFactor,
            reason: `Risk score ${riskScore} evaluated using CVSS ${maxCvss}, asset criticality '${target.criticality}', and ${alertEvidenceCount} observed alerts.`
          }
        });
      }
    }

    return pathResults;
  }
}
