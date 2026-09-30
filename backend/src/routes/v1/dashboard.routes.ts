import { Router } from "express";
import { getDashboardSummary, getDashboardAnalytics, globalSearch } from "../../controllers/dashboard.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

router.get("/dashboard/summary", requirePermission("SYSTEM_READ"), getDashboardSummary);
router.get("/dashboard/analytics", requirePermission("SYSTEM_READ"), getDashboardAnalytics);
router.get("/search", requirePermission("SYSTEM_READ"), globalSearch);

export default router;
