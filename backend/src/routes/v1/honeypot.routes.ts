import { Router } from "express";
import { 
  listHoneypots,
  getHoneypotById,
  createHoneypot,
  updateHoneypot,
  ingestHoneypotEvent,
  listHoneypotEvents,
  getHoneypotSessions
} from "../../controllers/honeypot.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

router.get("/honeypots", requirePermission("HONEYPOT_READ"), listHoneypots);
router.post("/honeypots", requirePermission("HONEYPOT_CREATE"), createHoneypot);
router.get("/honeypots/:id", requirePermission("HONEYPOT_READ"), getHoneypotById);
router.patch("/honeypots/:id", requirePermission("HONEYPOT_UPDATE"), updateHoneypot);

router.get("/honeypot-events", requirePermission("HONEYPOT_EVENT_READ"), listHoneypotEvents);
router.post("/honeypot-events", requirePermission("HONEYPOT_CREATE"), ingestHoneypotEvent);
router.get("/honeypots/:id/sessions", requirePermission("HONEYPOT_READ"), getHoneypotSessions);

export default router;
