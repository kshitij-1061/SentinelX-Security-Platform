import { Request, Response, NextFunction } from "express";
import { IncidentService } from "../services/incident.service";
import { 
  createIncidentSchema, 
  updateIncidentSchema, 
  addEvidenceSchema, 
  addNoteSchema, 
  executeResponseActionSchema 
} from "../schemas/incident.schema";

const incService = new IncidentService();

export const listIncidents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incidents = await incService.getIncidents(req.query as any);
    res.json({
      success: true,
      data: incidents
    });
  } catch (err) {
    next(err);
  }
};

export const getIncidentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await incService.getIncidentById(req.params.id);
    res.json({
      success: true,
      data: incident
    });
  } catch (err) {
    next(err);
  }
};

export const createIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createIncidentSchema.parse(req.body);
    const incident = await incService.createIncident(input, req.user?.id, req.ip, req.headers["user-agent"]);
    res.status(201).json({
      success: true,
      data: incident
    });
  } catch (err) {
    next(err);
  }
};

export const updateIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateIncidentSchema.parse(req.body);
    const incident = await incService.updateIncident(req.params.id, input, req.user?.id, req.ip, req.headers["user-agent"]);
    res.json({
      success: true,
      data: incident
    });
  } catch (err) {
    next(err);
  }
};

export const getIncidentTimeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const timeline = await incService.getIncidentTimeline(req.params.id);
    res.json({
      success: true,
      data: timeline
    });
  } catch (err) {
    next(err);
  }
};

export const addEvidence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = addEvidenceSchema.parse(req.body);
    const analystName = req.user?.email || "SOC Analyst";
    const evidence = await incService.addEvidence(req.params.id, input, analystName, req.user?.id, req.ip, req.headers["user-agent"]);
    res.status(201).json({
      success: true,
      data: evidence
    });
  } catch (err) {
    next(err);
  }
};

export const addNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = addNoteSchema.parse(req.body);
    const analystName = req.user?.email || "SOC Analyst";
    const note = await incService.addNote(req.params.id, input, analystName, req.user?.id, req.ip, req.headers["user-agent"]);
    res.status(201).json({
      success: true,
      data: note
    });
  } catch (err) {
    next(err);
  }
};

export const executeResponseAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = executeResponseActionSchema.parse(req.body);
    const analystName = req.user?.email || "SOC Analyst";
    const result = await incService.executeResponseAction(req.params.id, input, analystName, req.user?.id, req.ip, req.headers["user-agent"]);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};
