"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MitreService = void 0;
const threat_intel_repository_1 = require("../../repositories/threat-intel.repository");
const error_middleware_1 = require("../../middleware/error.middleware");
class MitreService {
    tiRepo;
    constructor() {
        this.tiRepo = new threat_intel_repository_1.ThreatIntelRepository();
    }
    async getTechniques() {
        return this.tiRepo.listMitreTechniques();
    }
    async getTechniqueById(techniqueId) {
        const tech = await this.tiRepo.findMitreTechniqueById(techniqueId);
        if (!tech) {
            throw new error_middleware_1.AppError(`MITRE technique '${techniqueId}' not found.`, 404, "NOT_FOUND");
        }
        return tech;
    }
}
exports.MitreService = MitreService;
