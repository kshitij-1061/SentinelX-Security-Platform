"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttackPathSchema = exports.attackPathEdgeTypeEnum = exports.attackPathNodeTypeEnum = void 0;
const zod_1 = require("zod");
exports.attackPathNodeTypeEnum = zod_1.z.enum(["INTERNET", "ASSET", "SERVICE", "USER", "CRITICAL_DATA"]);
exports.attackPathEdgeTypeEnum = zod_1.z.enum(["NETWORK_CONNECTIVITY", "TRUST_RELATIONSHIP", "VULNERABLE_EXPOSURE", "PRIVILEGE_ACCESS"]);
exports.createAttackPathSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Path name is required"),
    description: zod_1.z.string().min(5, "Description is required"),
    startNodeId: zod_1.z.string().min(1, "Start node ID is required"),
    targetNodeId: zod_1.z.string().min(1, "Target node ID is required"),
    severity: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("HIGH"),
    nodes: zod_1.z.array(zod_1.z.object({
        assetId: zod_1.z.string().optional(),
        nodeType: exports.attackPathNodeTypeEnum.default("ASSET"),
        label: zod_1.z.string(),
        stepIndex: zod_1.z.number().int().default(0),
        metadata: zod_1.z.record(zod_1.z.any()).optional()
    })),
    edges: zod_1.z.array(zod_1.z.object({
        sourceStep: zod_1.z.number().int(),
        targetStep: zod_1.z.number().int(),
        edgeType: exports.attackPathEdgeTypeEnum.default("NETWORK_CONNECTIVITY"),
        description: zod_1.z.string(),
        weight: zod_1.z.number().default(1.0)
    }))
});
