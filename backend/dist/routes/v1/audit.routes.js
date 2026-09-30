"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../../controllers/audit.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.authenticate, (0, rbac_middleware_1.requirePermission)("AUDIT_READ"), audit_controller_1.listAuditLogs);
exports.default = router;
