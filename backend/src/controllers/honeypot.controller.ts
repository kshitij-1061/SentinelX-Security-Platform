import { Request, Response, NextFunction } from "express";
import { HoneypotService } from "../services/deception/honeypot.service";
import { createHoneypotSchema, updateHoneypotSchema, ingestHoneypotEventSchema } from "../schemas/honeypot.schema";

const hpService = new HoneypotService();

export const listHoneypots = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const honeypots = await hpService.getHoneypots();
    res.json({
      success: true,
      data: honeypots
    });
  } catch (err) {
    next(err);
  }
};

export const getHoneypotById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hp = await hpService.getHoneypotById(req.params.id);
    res.json({
      success: true,
      data: hp
    });
  } catch (err) {
    next(err);
  }
};

export const createHoneypot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createHoneypotSchema.parse(req.body);
    const hp = await hpService.createHoneypot(input, req.user?.id, req.ip, req.headers["user-agent"]);
    res.status(201).json({
      success: true,
      data: hp
    });
  } catch (err) {
    next(err);
  }
};

export const updateHoneypot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateHoneypotSchema.parse(req.body);
    const hp = await hpService.updateHoneypot(req.params.id, input, req.user?.id, req.ip, req.headers["user-agent"]);
    res.json({
      success: true,
      data: hp
    });
  } catch (err) {
    next(err);
  }
};

export const ingestHoneypotEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = ingestHoneypotEventSchema.parse(req.body);
    const result = await hpService.ingestHoneypotEvent(input, req.user?.id, req.ip, req.headers["user-agent"]);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const listHoneypotEvents = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await hpService.getHoneypotEvents();
    res.json({
      success: true,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

export const getHoneypotSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await hpService.getHoneypotSessions(req.params.id);
    res.json({
      success: true,
      data: sessions
    });
  } catch (err) {
    next(err);
  }
};
