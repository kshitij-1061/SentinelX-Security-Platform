"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const audit_repository_1 = require("../repositories/audit.repository");
class AuditService {
    auditRepo;
    constructor() {
        this.auditRepo = new audit_repository_1.AuditRepository();
    }
    async logEvent(dto) {
        try {
            return await this.auditRepo.create(dto);
        }
        catch (err) {
            console.error("Failed to insert audit log:", err);
        }
    }
    async getLogs(skip = 0, limit = 100) {
        return this.auditRepo.listAll(skip, limit);
    }
}
exports.AuditService = AuditService;
