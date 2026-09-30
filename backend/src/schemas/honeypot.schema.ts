import { z } from "zod";

export const honeypotTypeEnum = z.enum(["SSH", "HTTP", "DATABASE_SIMULATION"]);
export const honeypotStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const createHoneypotSchema = z.object({
  name: z.string().min(3, "Honeypot name is required"),
  type: honeypotTypeEnum.default("SSH"),
  hostname: z.string().min(1, "Hostname is required"),
  ip: z.string().min(1, "IP address is required"),
  port: z.number().int().min(1).max(65535),
  status: honeypotStatusEnum.default("ACTIVE"),
  description: z.string().min(5, "Description is required")
});

export const updateHoneypotSchema = createHoneypotSchema.partial();

export const ingestHoneypotEventSchema = z.object({
  honeypotId: z.string().min(1, "Honeypot ID is required"),
  sourceIP: z.string().min(1, "Source IP is required"),
  destinationIP: z.string().optional(),
  protocol: z.string().default("TCP"),
  service: z.string().default("SSH"),
  username: z.string().optional(), // Password is NEVER accepted or stored!
  sessionId: z.string().optional(),
  eventType: z.string().default("PROBE"),
  requestData: z.string().optional(),
  commandData: z.string().optional()
});

export type CreateHoneypotInput = z.infer<typeof createHoneypotSchema>;
export type UpdateHoneypotInput = z.infer<typeof updateHoneypotSchema>;
export type IngestHoneypotEventInput = z.infer<typeof ingestHoneypotEventSchema>;
