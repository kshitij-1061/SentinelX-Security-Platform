import { Router } from "express";
import { 
  listIncidents, 
  getIncidentById, 
  createIncident, 
  updateIncident, 
  getIncidentTimeline, 
  addEvidence, 
  addNote, 
  executeResponseAction 
} from "../../controllers/incident.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

router.get("/incidents", requirePermission("INCIDENT_READ"), listIncidents);
router.post("/incidents", requirePermission("INCIDENT_CREATE"), createIncident);
router.get("/incidents/:id", requirePermission("INCIDENT_READ"), getIncidentById);
router.patch("/incidents/:id", requirePermission("INCIDENT_UPDATE"), updateIncident);

router.get("/incidents/:id/timeline", requirePermission("INCIDENT_READ"), getIncidentTimeline);
router.post("/incidents/:id/evidence", requirePermission("INCIDENT_UPDATE"), addEvidence);
router.post("/incidents/:id/notes", requirePermission("INCIDENT_UPDATE"), addNote);
router.post("/incidents/:id/actions", requirePermission("RESPONSE_SIMULATE"), executeResponseAction);

export default router;
