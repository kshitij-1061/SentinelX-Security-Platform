"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDetectionRuleSchema = exports.updateAlertStatusSchema = exports.alertQuerySchema = exports.eventQuerySchema = exports.createEventSchema = exports.alertStatusEnum = exports.eventSeverityEnum = exports.eventSourceEnum = void 0;
const zod_1 = require("zod");
exports.eventSourceEnum = zod_1.z.enum(["SURICATA", "ZEEK", "SYSLOG", "HONEYPOT", "GENERIC_JSON"]);
exports.eventSeverityEnum = zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
exports.alertStatusEnum = zod_1.z.enum(["NEW", "ACKNOWLEDGED", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"]);
exports.createEventSchema = zod_1.z.object({
    source: exports.eventSourceEnum.default("GENERIC_JSON"),
    eventType: zod_1.z.string().default("SECURITY_EVENT"),
    sourceIP: zod_1.z.string().optional(),
    destinationIP: zod_1.z.string().optional(),
    sourcePort: zod_1.z.number().int().optional(),
    destinationPort: zod_1.z.number().int().optional(),
    protocol: zod_1.z.string().optional(),
    username: zod_1.z.string().optional(),
    hostname: zod_1.z.string().optional(),
    process: zod_1.z.string().optional(),
    command: zod_1.z.string().optional(),
    rawPayload: zod_1.z.union([zod_1.z.record(zod_1.z.any()), zod_1.z.string()]),
    severity: exports.eventSeverityEnum.default("LOW")
});
exports.eventQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    source: exports.eventSourceEnum.optional(),
    severity: exports.eventSeverityEnum.optional(),
    sourceIP: zod_1.z.string().optional(),
    search: zod_1.z.string().optional()
});
exports.alertQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    severity: exports.eventSeverityEnum.optional(),
    status: exports.alertStatusEnum.optional(),
    mitreTechnique: zod_1.z.string().optional(),
    search: zod_1.z.string().optional()
});
exports.updateAlertStatusSchema = zod_1.z.object({
    status: exports.alertStatusEnum
});
exports.createDetectionRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Name is required"),
    description: zod_1.z.string().min(5, "Description is required"),
    severity: exports.eventSeverityEnum.default("MEDIUM"),
    source: zod_1.z.string().default("CUSTOM"),
    ruleDefinition: zod_1.z.union([zod_1.z.record(zod_1.z.any()), zod_1.z.string()]),
    enabled: zod_1.z.boolean().default(true),
    mitreTechnique: zod_1.z.string().optional()
});
