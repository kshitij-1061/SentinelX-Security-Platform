import { z } from "zod";

export const incidentSeverityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const incidentStatusEnum = z.enum(["NEW", "TRIAGED", "INVESTIGATING", "CONTAINED", "RESOLVED", "CLOSED", "FALSE_POSITIVE"]);
export const incidentActionTypeEnum = z.enum(["BLOCK_TEST_IP", "DISABLE_TEST_ACCOUNT", "ISOLATE_TEST_ENDPOINT", "ADD_TEST_BLOCKLIST", "CLOSE_INCIDENT"]);

export const createIncidentSchema = z.object({
  title: z.string().min(3, "Incident title is required"),
  description: z.string().min(5, "Description is required"),
  severity: incidentSeverityEnum.default("HIGH"),
  status: incidentStatusEnum.default("NEW"),
  confidence: z.number().min(0).max(1.0).default(0.9),
  assignedAnalyst: z.string().default("Unassigned"),
  alertIds: z.array(z.string()).optional(),
  assetIds: z.array(z.string()).optional(),
  correlationGroupId: z.string().optional()
});

export const updateIncidentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  severity: incidentSeverityEnum.optional(),
  status: incidentStatusEnum.optional(),
  assignedAnalyst: z.string().optional(),
  resolution: z.string().optional()
});

export const addEvidenceSchema = z.object({
  type: z.enum(["LOG_EXTRACT", "NETWORK_PCAP", "MEMORY_DUMP", "ARTIFACT_HASH"]).default("LOG_EXTRACT"),
  description: z.string().min(3, "Evidence description is required"),
  source: z.string().min(1, "Source identifier is required"),
  reference: z.string().min(1, "Reference URL or ID is required")
});

export const addNoteSchema = z.object({
  content: z.string().min(3, "Note content is required")
});

export const executeResponseActionSchema = z.object({
  action: incidentActionTypeEnum,
  target: z.string().min(1, "Action target parameter is required"),
  reason: z.string().min(5, "Justification reason is required"),
  confirmed: z.literal(true, { errorMap: () => ({ message: "Explicit analyst confirmation is mandatory for controlled response actions." }) })
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type AddEvidenceInput = z.infer<typeof addEvidenceSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
export type ExecuteResponseActionInput = z.infer<typeof executeResponseActionSchema>;
