"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const seed_1 = require("./db/seed");
async function main() {
    try {
        await database_1.prisma.$connect();
        console.log("[✓] Database connection established.");
        // Seed default roles and permissions if needed
        await (0, seed_1.seedDatabase)();
        const server = app_1.default.listen(env_1.env.PORT, () => {
            console.log(`[✓] Express Backend running on http://localhost:${env_1.env.PORT}`);
            console.log(`[✓] Swagger Documentation available at http://localhost:${env_1.env.PORT}/docs`);
        });
        const shutdown = async () => {
            console.log("Shutting down Express server gracefully...");
            server.close(async () => {
                await database_1.prisma.$disconnect();
                process.exit(0);
            });
        };
        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);
    }
    catch (err) {
        console.error("Fatal error starting Express server:", err);
        process.exit(1);
    }
}
main();
