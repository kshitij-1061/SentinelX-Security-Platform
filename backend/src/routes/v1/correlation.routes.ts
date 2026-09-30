import { Router } from "express";
import { listCorrelations, getCorrelationById, runCorrelation } from "../../controllers/correlation.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

router.get("/correlations", requirePermission("CORRELATION_READ"), listCorrelations);
router.post("/correlations/run", requirePermission("CORRELATION_CREATE"), runCorrelation);
router.get("/correlations/:id", requirePermission("CORRELATION_READ"), getCorrelationById);

export default router;
