"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeResponseActionSchema = exports.addNoteSchema = exports.addEvidenceSchema = exports.updateIncidentSchema = exports.createIncidentSchema = exports.incidentActionTypeEnum = exports.incidentStatusEnum = exports.incidentSeverityEnum = void 0;
const zod_1 = require("zod");
exports.incidentSeverityEnum = zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
exports.incidentStatusEnum = zod_1.z.enum(["NEW", "TRIAGED", "INVESTIGATING", "CONTAINED", "RESOLVED", "CLOSED", "FALSE_POSITIVE"]);
exports.incidentActionTypeEnum = zod_1.z.enum(["BLOCK_TEST_IP", "DISABLE_TEST_ACCOUNT", "ISOLATE_TEST_ENDPOINT", "ADD_TEST_BLOCKLIST", "CLOSE_INCIDENT"]);
exports.createIncidentSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Incident title is required"),
    description: zod_1.z.string().min(5, "Description is required"),
    severity: exports.incidentSeverityEnum.default("HIGH"),
    status: exports.incidentStatusEnum.default("NEW"),
    confidence: zod_1.z.number().min(0).max(1.0).default(0.9),
    assignedAnalyst: zod_1.z.string().default("Unassigned"),
    alertIds: zod_1.z.array(zod_1.z.string()).optional(),
    assetIds: zod_1.z.array(zod_1.z.string()).optional(),
    correlationGroupId: zod_1.z.string().optional()
});
exports.updateIncidentSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    severity: exports.incidentSeverityEnum.optional(),
    status: exports.incidentStatusEnum.optional(),
    assignedAnalyst: zod_1.z.string().optional(),
    resolution: zod_1.z.string().optional()
});
exports.addEvidenceSchema = zod_1.z.object({
    type: zod_1.z.enum(["LOG_EXTRACT", "NETWORK_PCAP", "MEMORY_DUMP", "ARTIFACT_HASH"]).default("LOG_EXTRACT"),
    description: zod_1.z.string().min(3, "Evidence description is required"),
    source: zod_1.z.string().min(1, "Source identifier is required"),
    reference: zod_1.z.string().min(1, "Reference URL or ID is required")
});
exports.addNoteSchema = zod_1.z.object({
    content: zod_1.z.string().min(3, "Note content is required")
});
exports.executeResponseActionSchema = zod_1.z.object({
    action: exports.incidentActionTypeEnum,
    target: zod_1.z.string().min(1, "Action target parameter is required"),
    reason: zod_1.z.string().min(5, "Justification reason is required"),
    confirmed: zod_1.z.literal(true, { errorMap: () => ({ message: "Explicit analyst confirmation is mandatory for controlled response actions." }) })
});
