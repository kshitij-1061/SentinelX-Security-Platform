import { Router } from "express";
import { 
  ingestEvent,
  listEvents,
  getEventById,
  listAlerts,
  getAlertById,
  updateAlertStatus,
  listDetectionRules,
  createDetectionRule,
  updateDetectionRule
} from "../../controllers/threat.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

// Events
router.post("/events", requirePermission("EVENT_CREATE"), ingestEvent);
router.get("/events", requirePermission("EVENT_READ"), listEvents);
router.get("/events/:id", requirePermission("EVENT_READ"), getEventById);

// Alerts
router.get("/alerts", requirePermission("ALERT_READ"), listAlerts);
router.get("/alerts/:id", requirePermission("ALERT_READ"), getAlertById);
router.patch("/alerts/:id", requirePermission("ALERT_UPDATE"), updateAlertStatus);

// Detection Rules
router.get("/detection-rules", requirePermission("DETECTION_RULE_READ"), listDetectionRules);
router.post("/detection-rules", requirePermission("DETECTION_RULE_CREATE"), createDetectionRule);
router.patch("/detection-rules/:id", requirePermission("DETECTION_RULE_UPDATE"), updateDetectionRule);

export default router;
