import { Router } from "express";
import { listUsers } from "../../controllers/user.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.get("/", authenticate, requirePermission("USER_READ"), listUsers);

export default router;
