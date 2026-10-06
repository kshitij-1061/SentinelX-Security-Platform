"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const threat_intel_controller_1 = require("../../controllers/threat-intel.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Threat Intelligence
router.get("/threat-intelligence", (0, rbac_middleware_1.requirePermission)("THREAT_INTEL_READ"), threat_intel_controller_1.listIndicators);
router.post("/threat-intelligence", (0, rbac_middleware_1.requirePermission)("THREAT_INTEL_CREATE"), threat_intel_controller_1.createIndicator);
router.get("/threat-intelligence/enrich", (0, rbac_middleware_1.requirePermission)("THREAT_INTEL_READ"), threat_intel_controller_1.enrichIoc);
router.get("/threat-intelligence/:id", (0, rbac_middleware_1.requirePermission)("THREAT_INTEL_READ"), threat_intel_controller_1.getIndicatorById);
// MITRE Techniques
router.get("/techniques", (0, rbac_middleware_1.requirePermission)("TECHNIQUE_READ"), threat_intel_controller_1.listTechniques);
router.get("/techniques/:id", (0, rbac_middleware_1.requirePermission)("TECHNIQUE_READ"), threat_intel_controller_1.getTechniqueById);
exports.default = router;
