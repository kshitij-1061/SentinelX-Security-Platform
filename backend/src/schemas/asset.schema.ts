import { z } from "zod";

export const ASSET_TYPES = [
  "SERVER",
  "WORKSTATION",
  "NETWORK_DEVICE",
  "DATABASE",
  "APPLICATION",
  "CONTAINER",
  "CLOUD_RESOURCE",
  "HONEY_POT"
] as const;

export const ASSET_STATUSES = ["ACTIVE", "INACTIVE", "UNKNOWN"] as const;

export const ASSET_CRITICALITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
export const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

export const assetServiceSchema = z.object({
  protocol: z.string().default("TCP"),
  port: z.number().int().min(1).max(65535),
  serviceName: z.string().min(1, "Service name is required"),
  serviceVersion: z.string().optional(),
  status: z.string().default("OPEN")
});

export const assetSoftwareSchema = z.object({
  name: z.string().min(1, "Software name is required"),
  version: z.string().min(1, "Software version is required"),
  vendor: z.string().optional(),
  installedAt: z.string().datetime().optional()
});

export const createAssetSchema = z.object({
  hostname: z.string().min(1, "Hostname is required"),
  ipAddress: z.string().regex(ipv4Regex, "Invalid IPv4 address format"),
  macAddress: z.string().regex(macRegex, "Invalid MAC address format").optional().nullable(),
  assetType: z.enum(ASSET_TYPES).default("SERVER"),
  operatingSystem: z.string().optional(),
  operatingSystemVersion: z.string().optional(),
  environment: z.string().optional().default("PRODUCTION"),
  criticality: z.enum(ASSET_CRITICALITIES).default("MEDIUM"),
  owner: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(ASSET_STATUSES).default("ACTIVE"),
  services: z.array(assetServiceSchema).optional().default([]),
  software: z.array(assetSoftwareSchema).optional().default([])
});

export const updateAssetSchema = createAssetSchema.partial();

export const importAssetItemSchema = z.object({
  hostname: z.string().min(1, "Hostname is required"),
  ipAddress: z.string().regex(ipv4Regex, "Invalid IPv4 address format"),
  macAddress: z.string().optional().nullable(),
  assetType: z.enum(ASSET_TYPES).optional().default("SERVER"),
  operatingSystem: z.string().optional(),
  operatingSystemVersion: z.string().optional(),
  environment: z.string().optional().default("PRODUCTION"),
  criticality: z.enum(ASSET_CRITICALITIES).optional().default("MEDIUM"),
  owner: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(ASSET_STATUSES).optional().default("ACTIVE"),
  services: z.array(assetServiceSchema).optional().default([]),
  software: z.array(assetSoftwareSchema).optional().default([])
});

export const importAssetSchema = z.object({
  records: z.array(importAssetItemSchema).min(1, "At least one record is required for import")
});

export const discoverySchema = z.object({
  provider: z.enum(["MOCK", "MANUAL", "LAB_PROBE"]).default("MOCK"),
  targetSubnet: z.string().optional().default("192.168.1.0/24")
});

export const assetQuerySchema = z.object({
  page: z.string().optional().transform(Number).default("1"),
  limit: z.string().optional().transform(Number).default("10"),
  search: z.string().optional(),
  assetType: z.enum(ASSET_TYPES).optional(),
  status: z.enum(ASSET_STATUSES).optional(),
  criticality: z.enum(ASSET_CRITICALITIES).optional(),
  environment: z.string().optional(),
  operatingSystem: z.string().optional(),
  ipAddress: z.string().optional(),
  hostname: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc")
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type ImportAssetInput = z.infer<typeof importAssetSchema>;
export type DiscoveryInput = z.infer<typeof discoverySchema>;
export type AssetQueryInput = z.infer<typeof assetQuerySchema>;
