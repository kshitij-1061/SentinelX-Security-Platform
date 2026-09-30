import { z } from "zod";

export const threatIndicatorTypeEnum = z.enum(["IP", "DOMAIN", "URL", "HASH"]);

export const createThreatIndicatorSchema = z.object({
  type: threatIndicatorTypeEnum,
  value: z.string().min(1, "Indicator value is required"),
  source: z.string().default("MANUAL"),
  confidence: z.number().min(0).max(1.0).default(0.9),
  tags: z.array(z.string()).default([]),
  description: z.string().min(3, "Description is required")
});

export const updateThreatIndicatorSchema = createThreatIndicatorSchema.partial();

export type CreateThreatIndicatorInput = z.infer<typeof createThreatIndicatorSchema>;
export type UpdateThreatIndicatorInput = z.infer<typeof updateThreatIndicatorSchema>;
