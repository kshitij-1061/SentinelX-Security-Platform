import { Router } from "express";
import { register, login, logout, getMe } from "../../controllers/auth.controller";
import { authenticate } from "../../middleware/auth.middleware";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication requests per windowMs
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many authentication requests from this IP, please try again later."
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
