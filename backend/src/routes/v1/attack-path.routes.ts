import { Router } from "express";
import { 
  listAttackPaths, 
  getAttackPathById, 
  getPathRiskAssessment, 
  analyzeAttackPaths 
} from "../../controllers/attack-path.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

router.get("/attack-paths", requirePermission("ATTACK_PATH_READ"), listAttackPaths);
router.post("/attack-paths/analyze", requirePermission("ATTACK_PATH_ANALYZE"), analyzeAttackPaths);
router.get("/attack-paths/:id", requirePermission("ATTACK_PATH_READ"), getAttackPathById);
router.get("/attack-paths/:id/risk", requirePermission("RISK_READ"), getPathRiskAssessment);

export default router;
