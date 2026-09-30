import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import v1Router from "./routes/v1/index";
import { errorMiddleware, AppError } from "./middleware/error.middleware";
import { swaggerDocument } from "./utils/swagger";

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [env.CORS_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP Request logging
if (env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// Swagger API Documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Enterprise Cyber Defense & Attack Path Intelligence Platform API (Express + TypeScript)",
    docs: "/docs",
    health: "/api/v1/health"
  });
});

// Register API v1 Router
app.use("/api/v1", v1Router);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404, "NOT_FOUND"));
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

export default app;
