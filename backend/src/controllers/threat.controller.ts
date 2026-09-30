import { Request, Response, NextFunction } from "express";
import { ThreatService } from "../services/threat.service";
import { 
  createEventSchema, 
  eventQuerySchema, 
  alertQuerySchema, 
  updateAlertStatusSchema, 
  createDetectionRuleSchema 
} from "../schemas/threat.schema";

const threatService = new ThreatService();

export const ingestEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createEventSchema.parse(req.body);
    const result = await threatService.ingestEvent(input, req.user?.id, req.ip, req.headers["user-agent"]);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const listEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = eventQuerySchema.parse(req.query);
    const result = await threatService.getEvents(query);
    res.json({
      success: true,
      data: result.events,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await threatService.getEventById(req.params.id);
    res.json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
};

export const listAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = alertQuerySchema.parse(req.query);
    const result = await threatService.getAlerts(query);
    res.json({
      success: true,
      data: result.alerts,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

export const getAlertById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alert = await threatService.getAlertById(req.params.id);
    res.json({
      success: true,
      data: alert
    });
  } catch (err) {
    next(err);
  }
};

export const updateAlertStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateAlertStatusSchema.parse(req.body);
    const alert = await threatService.updateAlertStatus(req.params.id, input.status, req.user?.id, req.ip, req.headers["user-agent"]);
    res.json({
      success: true,
      data: alert
    });
  } catch (err) {
    next(err);
  }
};

export const listDetectionRules = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = await threatService.getDetectionRules();
    res.json({
      success: true,
      data: rules
    });
  } catch (err) {
    next(err);
  }
};

export const createDetectionRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createDetectionRuleSchema.parse(req.body);
    const rule = await threatService.createDetectionRule(input, req.user?.id, req.ip, req.headers["user-agent"]);
    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (err) {
    next(err);
  }
};

export const updateDetectionRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rule = await threatService.updateDetectionRule(req.params.id, req.body, req.user?.id, req.ip, req.headers["user-agent"]);
    res.json({
      success: true,
      data: rule
    });
  } catch (err) {
    next(err);
  }
};
