"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const threat_controller_1 = require("../../controllers/threat.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Events
router.post("/events", (0, rbac_middleware_1.requirePermission)("EVENT_CREATE"), threat_controller_1.ingestEvent);
router.get("/events", (0, rbac_middleware_1.requirePermission)("EVENT_READ"), threat_controller_1.listEvents);
router.get("/events/:id", (0, rbac_middleware_1.requirePermission)("EVENT_READ"), threat_controller_1.getEventById);
// Alerts
router.get("/alerts", (0, rbac_middleware_1.requirePermission)("ALERT_READ"), threat_controller_1.listAlerts);
router.get("/alerts/:id", (0, rbac_middleware_1.requirePermission)("ALERT_READ"), threat_controller_1.getAlertById);
router.patch("/alerts/:id", (0, rbac_middleware_1.requirePermission)("ALERT_UPDATE"), threat_controller_1.updateAlertStatus);
// Detection Rules
router.get("/detection-rules", (0, rbac_middleware_1.requirePermission)("DETECTION_RULE_READ"), threat_controller_1.listDetectionRules);
router.post("/detection-rules", (0, rbac_middleware_1.requirePermission)("DETECTION_RULE_CREATE"), threat_controller_1.createDetectionRule);
router.patch("/detection-rules/:id", (0, rbac_middleware_1.requirePermission)("DETECTION_RULE_UPDATE"), threat_controller_1.updateDetectionRule);
exports.default = router;
