import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";
import { seedDatabase } from "./db/seed";

async function main() {
  try {
    await prisma.$connect();
    console.log("[✓] Database connection established.");

    // Seed default roles and permissions if needed
    await seedDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(`[✓] Express Backend running on http://localhost:${env.PORT}`);
      console.log(`[✓] Swagger Documentation available at http://localhost:${env.PORT}/docs`);
    });

    const shutdown = async () => {
      console.log("Shutting down Express server gracefully...");
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    console.error("Fatal error starting Express server:", err);
    process.exit(1);
  }
}

main();
