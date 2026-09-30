import { z } from "zod";

export const eventSourceEnum = z.enum(["SURICATA", "ZEEK", "SYSLOG", "HONEYPOT", "GENERIC_JSON"]);
export const eventSeverityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const alertStatusEnum = z.enum(["NEW", "ACKNOWLEDGED", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"]);

export const createEventSchema = z.object({
  source: eventSourceEnum.default("GENERIC_JSON"),
  eventType: z.string().default("SECURITY_EVENT"),
  sourceIP: z.string().optional(),
  destinationIP: z.string().optional(),
  sourcePort: z.number().int().optional(),
  destinationPort: z.number().int().optional(),
  protocol: z.string().optional(),
  username: z.string().optional(),
  hostname: z.string().optional(),
  process: z.string().optional(),
  command: z.string().optional(),
  rawPayload: z.union([z.record(z.any()), z.string()]),
  severity: eventSeverityEnum.default("LOW")
});

export const eventQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  source: eventSourceEnum.optional(),
  severity: eventSeverityEnum.optional(),
  sourceIP: z.string().optional(),
  search: z.string().optional()
});

export const alertQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  severity: eventSeverityEnum.optional(),
  status: alertStatusEnum.optional(),
  mitreTechnique: z.string().optional(),
  search: z.string().optional()
});

export const updateAlertStatusSchema = z.object({
  status: alertStatusEnum
});

export const createDetectionRuleSchema = z.object({
  name: z.string().min(3, "Name is required"),
  description: z.string().min(5, "Description is required"),
  severity: eventSeverityEnum.default("MEDIUM"),
  source: z.string().default("CUSTOM"),
  ruleDefinition: z.union([z.record(z.any()), z.string()]),
  enabled: z.boolean().default(true),
  mitreTechnique: z.string().optional()
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
export type AlertQueryInput = z.infer<typeof alertQuerySchema>;
export type UpdateAlertStatusInput = z.infer<typeof updateAlertStatusSchema>;
export type CreateDetectionRuleInput = z.infer<typeof createDetectionRuleSchema>;
