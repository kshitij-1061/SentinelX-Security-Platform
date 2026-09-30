import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import auditRoutes from "./audit.routes";
import assetRoutes from "./asset.routes";
import vulnerabilityRoutes from "./vulnerability.routes";
import threatRoutes from "./threat.routes";
import honeypotRoutes from "./honeypot.routes";
import correlationRoutes from "./correlation.routes";
import threatIntelRoutes from "./threat-intel.routes";
import attackPathRoutes from "./attack-path.routes";
import incidentRoutes from "./incident.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/audit-logs", auditRoutes);
router.use("/assets", assetRoutes);
router.use("/", vulnerabilityRoutes);
router.use("/", threatRoutes);
router.use("/", honeypotRoutes);
router.use("/", correlationRoutes);
router.use("/", threatIntelRoutes);
router.use("/", attackPathRoutes);
router.use("/", incidentRoutes);
router.use("/", dashboardRoutes);

export default router;
