"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestHoneypotEventSchema = exports.updateHoneypotSchema = exports.createHoneypotSchema = exports.honeypotStatusEnum = exports.honeypotTypeEnum = void 0;
const zod_1 = require("zod");
exports.honeypotTypeEnum = zod_1.z.enum(["SSH", "HTTP", "DATABASE_SIMULATION"]);
exports.honeypotStatusEnum = zod_1.z.enum(["ACTIVE", "INACTIVE"]);
exports.createHoneypotSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Honeypot name is required"),
    type: exports.honeypotTypeEnum.default("SSH"),
    hostname: zod_1.z.string().min(1, "Hostname is required"),
    ip: zod_1.z.string().min(1, "IP address is required"),
    port: zod_1.z.number().int().min(1).max(65535),
    status: exports.honeypotStatusEnum.default("ACTIVE"),
    description: zod_1.z.string().min(5, "Description is required")
});
exports.updateHoneypotSchema = exports.createHoneypotSchema.partial();
exports.ingestHoneypotEventSchema = zod_1.z.object({
    honeypotId: zod_1.z.string().min(1, "Honeypot ID is required"),
    sourceIP: zod_1.z.string().min(1, "Source IP is required"),
    destinationIP: zod_1.z.string().optional(),
    protocol: zod_1.z.string().default("TCP"),
    service: zod_1.z.string().default("SSH"),
    username: zod_1.z.string().optional(), // Password is NEVER accepted or stored!
    sessionId: zod_1.z.string().optional(),
    eventType: zod_1.z.string().default("PROBE"),
    requestData: zod_1.z.string().optional(),
    commandData: zod_1.z.string().optional()
});
