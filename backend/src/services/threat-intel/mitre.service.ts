import { ThreatIntelRepository } from "../../repositories/threat-intel.repository";
import { AppError } from "../../middleware/error.middleware";

export class MitreService {
  private tiRepo: ThreatIntelRepository;

  constructor() {
    this.tiRepo = new ThreatIntelRepository();
  }

  async getTechniques() {
    return this.tiRepo.listMitreTechniques();
  }

  async getTechniqueById(techniqueId: string) {
    const tech = await this.tiRepo.findMitreTechniqueById(techniqueId);
    if (!tech) {
      throw new AppError(`MITRE technique '${techniqueId}' not found.`, 404, "NOT_FOUND");
    }
    return tech;
  }
}
