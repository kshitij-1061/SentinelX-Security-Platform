"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogs = listAuditLogs;
const audit_service_1 = require("../services/audit.service");
const auditService = new audit_service_1.AuditService();
async function listAuditLogs(req, res, next) {
    try {
        const skip = Number(req.query.skip) || 0;
        const limit = Number(req.query.limit) || 100;
        const logs = await auditService.getLogs(skip, limit);
        res.status(200).json({
            success: true,
            data: logs,
            message: "Audit logs retrieved successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
