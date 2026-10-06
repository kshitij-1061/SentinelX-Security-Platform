"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateThreatIndicatorSchema = exports.createThreatIndicatorSchema = exports.threatIndicatorTypeEnum = void 0;
const zod_1 = require("zod");
exports.threatIndicatorTypeEnum = zod_1.z.enum(["IP", "DOMAIN", "URL", "HASH"]);
exports.createThreatIndicatorSchema = zod_1.z.object({
    type: exports.threatIndicatorTypeEnum,
    value: zod_1.z.string().min(1, "Indicator value is required"),
    source: zod_1.z.string().default("MANUAL"),
    confidence: zod_1.z.number().min(0).max(1.0).default(0.9),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    description: zod_1.z.string().min(3, "Description is required")
});
exports.updateThreatIndicatorSchema = exports.createThreatIndicatorSchema.partial();
