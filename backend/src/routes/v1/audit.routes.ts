import { Router } from "express";
import { listAuditLogs } from "../../controllers/audit.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.get("/", authenticate, requirePermission("AUDIT_READ"), listAuditLogs);

export default router;
