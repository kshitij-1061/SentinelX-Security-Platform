"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetQuerySchema = exports.discoverySchema = exports.importAssetSchema = exports.importAssetItemSchema = exports.updateAssetSchema = exports.createAssetSchema = exports.assetSoftwareSchema = exports.assetServiceSchema = exports.macRegex = exports.ipv4Regex = exports.ASSET_CRITICALITIES = exports.ASSET_STATUSES = exports.ASSET_TYPES = void 0;
const zod_1 = require("zod");
exports.ASSET_TYPES = [
    "SERVER",
    "WORKSTATION",
    "NETWORK_DEVICE",
    "DATABASE",
    "APPLICATION",
    "CONTAINER",
    "CLOUD_RESOURCE",
    "HONEY_POT"
];
exports.ASSET_STATUSES = ["ACTIVE", "INACTIVE", "UNKNOWN"];
exports.ASSET_CRITICALITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
exports.ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
exports.macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
exports.assetServiceSchema = zod_1.z.object({
    protocol: zod_1.z.string().default("TCP"),
    port: zod_1.z.number().int().min(1).max(65535),
    serviceName: zod_1.z.string().min(1, "Service name is required"),
    serviceVersion: zod_1.z.string().optional(),
    status: zod_1.z.string().default("OPEN")
});
exports.assetSoftwareSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Software name is required"),
    version: zod_1.z.string().min(1, "Software version is required"),
    vendor: zod_1.z.string().optional(),
    installedAt: zod_1.z.string().datetime().optional()
});
exports.createAssetSchema = zod_1.z.object({
    hostname: zod_1.z.string().min(1, "Hostname is required"),
    ipAddress: zod_1.z.string().regex(exports.ipv4Regex, "Invalid IPv4 address format"),
    macAddress: zod_1.z.string().regex(exports.macRegex, "Invalid MAC address format").optional().nullable(),
    assetType: zod_1.z.enum(exports.ASSET_TYPES).default("SERVER"),
    operatingSystem: zod_1.z.string().optional(),
    operatingSystemVersion: zod_1.z.string().optional(),
    environment: zod_1.z.string().optional().default("PRODUCTION"),
    criticality: zod_1.z.enum(exports.ASSET_CRITICALITIES).default("MEDIUM"),
    owner: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    status: zod_1.z.enum(exports.ASSET_STATUSES).default("ACTIVE"),
    services: zod_1.z.array(exports.assetServiceSchema).optional().default([]),
    software: zod_1.z.array(exports.assetSoftwareSchema).optional().default([])
});
exports.updateAssetSchema = exports.createAssetSchema.partial();
exports.importAssetItemSchema = zod_1.z.object({
    hostname: zod_1.z.string().min(1, "Hostname is required"),
    ipAddress: zod_1.z.string().regex(exports.ipv4Regex, "Invalid IPv4 address format"),
    macAddress: zod_1.z.string().optional().nullable(),
    assetType: zod_1.z.enum(exports.ASSET_TYPES).optional().default("SERVER"),
    operatingSystem: zod_1.z.string().optional(),
    operatingSystemVersion: zod_1.z.string().optional(),
    environment: zod_1.z.string().optional().default("PRODUCTION"),
    criticality: zod_1.z.enum(exports.ASSET_CRITICALITIES).optional().default("MEDIUM"),
    owner: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    status: zod_1.z.enum(exports.ASSET_STATUSES).optional().default("ACTIVE"),
    services: zod_1.z.array(exports.assetServiceSchema).optional().default([]),
    software: zod_1.z.array(exports.assetSoftwareSchema).optional().default([])
});
exports.importAssetSchema = zod_1.z.object({
    records: zod_1.z.array(exports.importAssetItemSchema).min(1, "At least one record is required for import")
});
exports.discoverySchema = zod_1.z.object({
    provider: zod_1.z.enum(["MOCK", "MANUAL", "LAB_PROBE"]).default("MOCK"),
    targetSubnet: zod_1.z.string().optional().default("192.168.1.0/24")
});
exports.assetQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(Number).default("1"),
    limit: zod_1.z.string().optional().transform(Number).default("10"),
    search: zod_1.z.string().optional(),
    assetType: zod_1.z.enum(exports.ASSET_TYPES).optional(),
    status: zod_1.z.enum(exports.ASSET_STATUSES).optional(),
    criticality: zod_1.z.enum(exports.ASSET_CRITICALITIES).optional(),
    environment: zod_1.z.string().optional(),
    operatingSystem: zod_1.z.string().optional(),
    ipAddress: zod_1.z.string().optional(),
    hostname: zod_1.z.string().optional(),
    sortBy: zod_1.z.string().optional().default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc")
});
