import { Request, Response, NextFunction } from "express";
import { ThreatIntelService } from "../services/threat-intel/threat-intel.service";
import { MitreService } from "../services/threat-intel/mitre.service";
import { createThreatIndicatorSchema } from "../schemas/correlation.schema";

const tiService = new ThreatIntelService();
const mitreService = new MitreService();

export const listIndicators = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const indicators = await tiService.getIndicators(req.query.type as string);
    res.json({
      success: true,
      data: indicators
    });
  } catch (err) {
    next(err);
  }
};

export const getIndicatorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const indicator = await tiService.getIndicatorByValue(req.params.id);
    res.json({
      success: true,
      data: indicator
    });
  } catch (err) {
    next(err);
  }
};

export const createIndicator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createThreatIndicatorSchema.parse(req.body);
    const indicator = await tiService.createIndicator(input, req.user?.id, req.ip, req.headers["user-agent"]);
    res.status(201).json({
      success: true,
      data: indicator
    });
  } catch (err) {
    next(err);
  }
};

export const enrichIoc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tiService.enrichIoc(req.query.ioc as string);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const listTechniques = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const techniques = await mitreService.getTechniques();
    res.json({
      success: true,
      data: techniques
    });
  } catch (err) {
    next(err);
  }
};

export const getTechniqueById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const technique = await mitreService.getTechniqueById(req.params.id);
    res.json({
      success: true,
      data: technique
    });
  } catch (err) {
    next(err);
  }
};
