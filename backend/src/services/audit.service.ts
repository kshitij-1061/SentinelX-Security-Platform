import { AuditRepository, CreateAuditLogDto } from "../repositories/audit.repository";

export class AuditService {
  private auditRepo: AuditRepository;

  constructor() {
    this.auditRepo = new AuditRepository();
  }

  async logEvent(dto: CreateAuditLogDto) {
    try {
      return await this.auditRepo.create(dto);
    } catch (err) {
      console.error("Failed to insert audit log:", err);
    }
  }

  async getLogs(skip = 0, limit = 100) {
    return this.auditRepo.listAll(skip, limit);
  }
}
