"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRiskScore = calculateRiskScore;
const CRITICALITY_WEIGHTS = {
    CRITICAL: 1.5,
    HIGH: 1.25,
    MEDIUM: 1.0,
    LOW: 0.75
};
const EXPOSURE_WEIGHTS = {
    EXTERNAL_FACING: 1.5,
    DMZ: 1.3,
    INTERNAL: 1.0,
    AIR_GAPPED: 0.5
};
const EXPLOITABILITY_WEIGHTS = {
    HIGH: 1.4,
    FUNCTIONAL: 1.2,
    PROOF_OF_CONCEPT: 1.0,
    UNPROVEN: 0.8
};
const SEVERITY_WEIGHTS = {
    CRITICAL: 1.3,
    HIGH: 1.15,
    MEDIUM: 1.0,
    LOW: 0.85
};
/**
 * Calculates a deterministic, explainable risk score (0.0 to 100.0) based on CVSS,
 * asset criticality, network exposure level, exploitability state, and severity.
 */
function calculateRiskScore(params) {
    const cvss = Math.min(10, Math.max(0, params.cvssScore || 0));
    const criticality = (params.assetCriticality || "MEDIUM").toUpperCase();
    const exposure = (params.exposure || "INTERNAL").toUpperCase();
    const exploitability = (params.exploitability || "UNPROVEN").toUpperCase();
    const severity = (params.severity || "MEDIUM").toUpperCase();
    const criticalityWeight = CRITICALITY_WEIGHTS[criticality] || 1.0;
    const exposureWeight = EXPOSURE_WEIGHTS[exposure] || 1.0;
    const exploitabilityWeight = EXPLOITABILITY_WEIGHTS[exploitability] || 1.0;
    const severityWeight = SEVERITY_WEIGHTS[severity] || 1.0;
    const cvssBaseContribution = cvss * 10; // 0 - 100 scale
    // Normalized product of multipliers divided by baseline factor 2.0
    const rawScore = (cvssBaseContribution * criticalityWeight * exposureWeight * exploitabilityWeight * severityWeight) / 2.0;
    const riskScore = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10));
    let riskGrade = "LOW";
    if (riskScore >= 80) {
        riskGrade = "CRITICAL";
    }
    else if (riskScore >= 60) {
        riskGrade = "HIGH";
    }
    else if (riskScore >= 40) {
        riskGrade = "MEDIUM";
    }
    return {
        riskScore,
        riskGrade,
        factors: {
            cvssScore: cvss,
            cvssBaseContribution,
            assetCriticality: criticality,
            criticalityWeight,
            exposure,
            exposureWeight,
            exploitability,
            exploitabilityWeight,
            severity,
            severityWeight
        }
    };
}
