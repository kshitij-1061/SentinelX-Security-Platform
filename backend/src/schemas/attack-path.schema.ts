import { z } from "zod";

export const attackPathNodeTypeEnum = z.enum(["INTERNET", "ASSET", "SERVICE", "USER", "CRITICAL_DATA"]);
export const attackPathEdgeTypeEnum = z.enum(["NETWORK_CONNECTIVITY", "TRUST_RELATIONSHIP", "VULNERABLE_EXPOSURE", "PRIVILEGE_ACCESS"]);

export const createAttackPathSchema = z.object({
  name: z.string().min(3, "Path name is required"),
  description: z.string().min(5, "Description is required"),
  startNodeId: z.string().min(1, "Start node ID is required"),
  targetNodeId: z.string().min(1, "Target node ID is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("HIGH"),
  nodes: z.array(z.object({
    assetId: z.string().optional(),
    nodeType: attackPathNodeTypeEnum.default("ASSET"),
    label: z.string(),
    stepIndex: z.number().int().default(0),
    metadata: z.record(z.any()).optional()
  })),
  edges: z.array(z.object({
    sourceStep: z.number().int(),
    targetStep: z.number().int(),
    edgeType: attackPathEdgeTypeEnum.default("NETWORK_CONNECTIVITY"),
    description: z.string(),
    weight: z.number().default(1.0)
  }))
});

export type CreateAttackPathInput = z.infer<typeof createAttackPathSchema>;
