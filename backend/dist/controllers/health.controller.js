"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = healthCheck;
const database_1 = require("../config/database");
async function healthCheck(req, res, next) {
    let dbStatus = "healthy";
    try {
        await database_1.prisma.$queryRaw `SELECT 1`;
    }
    catch (err) {
        dbStatus = `unhealthy: ${err.message}`;
    }
    res.status(200).json({
        success: true,
        data: {
            status: "online",
            database: dbStatus,
            service: "Enterprise Cyber Defense & Attack Path Intelligence Platform Backend (Node/Express)",
            version: "1.0.0"
        },
        message: "System health check successful"
    });
}
