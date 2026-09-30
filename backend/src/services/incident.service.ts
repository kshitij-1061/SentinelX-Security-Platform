import { IncidentRepository } from "../repositories/incident.repository";
import { SimulationResponseProvider } from "./response/simulation.response";
import { AuditService } from "./audit.service";
import { 
  CreateIncidentInput, 
  UpdateIncidentInput, 
  AddEvidenceInput, 
  AddNoteInput, 
  ExecuteResponseActionInput 
} from "../schemas/incident.schema";
import { AppError } from "../middleware/error.middleware";

export class IncidentService {
  private incRepo: IncidentRepository;
  private responseProvider: SimulationResponseProvider;
  private auditService: AuditService;

  constructor() {
    this.incRepo = new IncidentRepository();
    this.responseProvider = new SimulationResponseProvider();
    this.auditService = new AuditService();
  }

  async getIncidents(query: { status?: string; severity?: string; assignedAnalyst?: string }) {
    return this.incRepo.listIncidents(query);
  }

  async getIncidentById(id: string) {
    const incident = await this.incRepo.findIncidentById(id);
    if (!incident) {
      throw new AppError(`Incident with ID '${id}' not found.`, 404, "NOT_FOUND");
    }
    return incident;
  }

  async createIncident(input: CreateIncidentInput, userId?: string, ipAddress?: string, userAgent?: string) {
    const incident = await this.incRepo.createIncident(input);

    await this.auditService.logEvent({
      action: "INCIDENT_CREATE",
      status: "SUCCESS",
      userId,
      resource: "Incident",
      resourceId: incident?.id,
      ipAddress,
      userAgent,
      metadata: { title: incident?.title, severity: incident?.severity }
    });

    return incident;
  }

  async updateIncident(id: string, input: UpdateIncidentInput, userId?: string, ipAddress?: string, userAgent?: string) {
    await this.getIncidentById(id);

    const updated = await this.incRepo.updateIncident(id, input);

    await this.auditService.logEvent({
      action: "INCIDENT_UPDATE",
      status: "SUCCESS",
      userId,
      resource: "Incident",
      resourceId: id,
      ipAddress,
      userAgent,
      metadata: { input }
    });

    return updated;
  }

  async getIncidentTimeline(id: string) {
    const incident = await this.getIncidentById(id);

    const timeline: any[] = [];

    // Incident creation event
    timeline.push({
      timestamp: incident.detectedAt,
      type: "INCIDENT_DETECTED",
      title: "Incident Detected & Registered",
      description: incident.description,
      author: incident.assignedAnalyst
    });

    // Alert triggers
    incident.alerts.forEach((link) => {
      timeline.push({
        timestamp: link.alert.timestamp,
        type: "ALERT_TRIGGERED",
        title: `Security Alert: ${link.alert.detectionRule?.name || link.alert.description}`,
        description: `Severity: ${link.alert.severity}, MITRE: ${link.alert.mitreTechnique || "N/A"}`,
        author: "Detection Engine"
      });
    });

    // Evidence additions
    incident.evidence.forEach((ev) => {
      timeline.push({
        timestamp: ev.createdAt,
        type: "EVIDENCE_ADDED",
        title: `Evidence Preserved: [${ev.type}] ${ev.description}`,
        description: `Source: ${ev.source} | Ref: ${ev.reference}`,
        author: ev.createdBy
      });
    });

    // Analyst notes
    incident.notes.forEach((n) => {
      timeline.push({
        timestamp: n.createdAt,
        type: "ANALYST_NOTE",
        title: `Analyst Note Added`,
        description: n.content,
        author: n.author
      });
    });

    // Response actions
    incident.actions.forEach((act) => {
      timeline.push({
        timestamp: act.createdAt,
        type: "RESPONSE_ACTION",
        title: `Response Executed [${act.mode}]: ${act.action}`,
        description: `Target: ${act.target} | Reason: ${act.reason}`,
        author: act.analyst
      });
    });

    // Sort timeline chronologically by real timestamps
    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return timeline;
  }

  async addEvidence(id: string, input: AddEvidenceInput, analystName: string, userId?: string, ipAddress?: string, userAgent?: string) {
    await this.getIncidentById(id);

    const evidence = await this.incRepo.addEvidence(id, input, analystName);

    await this.auditService.logEvent({
      action: "INCIDENT_EVIDENCE_ADD",
      status: "SUCCESS",
      userId,
      resource: "IncidentEvidence",
      resourceId: evidence.id,
      ipAddress,
      userAgent,
      metadata: { type: evidence.type, source: evidence.source }
    });

    return evidence;
  }

  async addNote(id: string, input: AddNoteInput, analystName: string, userId?: string, ipAddress?: string, userAgent?: string) {
    await this.getIncidentById(id);

    const note = await this.incRepo.addNote(id, analystName, input.content);

    await this.auditService.logEvent({
      action: "INCIDENT_NOTE_ADD",
      status: "SUCCESS",
      userId,
      resource: "IncidentNote",
      resourceId: note.id,
      ipAddress,
      userAgent
    });

    return note;
  }

  async executeResponseAction(id: string, input: ExecuteResponseActionInput, analystName: string, userId?: string, ipAddress?: string, userAgent?: string) {
    await this.getIncidentById(id);

    // 1. Execute safe simulation action
    const result = await this.responseProvider.executeAction(input, analystName);

    // 2. Record action in database
    const dbAction = await this.incRepo.recordAction(id, {
      analyst: analystName,
      action: input.action,
      target: input.target,
      reason: input.reason,
      result: result.auditDetails,
      mode: result.mode
    });

    // 3. Audit response execution
    await this.auditService.logEvent({
      action: "RESPONSE_SIMULATE",
      status: "SUCCESS",
      userId,
      resource: "IncidentAction",
      resourceId: dbAction.id,
      ipAddress,
      userAgent,
      metadata: { action: input.action, target: input.target, mode: result.mode }
    });

    // 4. Auto resolve if action was CLOSE_INCIDENT
    if (input.action === "CLOSE_INCIDENT") {
      await this.incRepo.updateIncident(id, { status: "RESOLVED", resolution: input.reason });
    }

    return {
      action: dbAction,
      simulationResult: result
    };
  }
}
