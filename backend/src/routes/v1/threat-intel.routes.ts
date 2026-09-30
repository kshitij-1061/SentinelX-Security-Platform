import { Router } from "express";
import { 
  listIndicators, 
  getIndicatorById, 
  createIndicator, 
  enrichIoc, 
  listTechniques, 
  getTechniqueById 
} from "../../controllers/threat-intel.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

// Threat Intelligence
router.get("/threat-intelligence", requirePermission("THREAT_INTEL_READ"), listIndicators);
router.post("/threat-intelligence", requirePermission("THREAT_INTEL_CREATE"), createIndicator);
router.get("/threat-intelligence/enrich", requirePermission("THREAT_INTEL_READ"), enrichIoc);
router.get("/threat-intelligence/:id", requirePermission("THREAT_INTEL_READ"), getIndicatorById);

// MITRE Techniques
router.get("/techniques", requirePermission("TECHNIQUE_READ"), listTechniques);
router.get("/techniques/:id", requirePermission("TECHNIQUE_READ"), getTechniqueById);

export default router;
