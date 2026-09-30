import { Request, Response, NextFunction } from "express";
import { CorrelationRepository } from "../repositories/correlation.repository";
import { CorrelationEngine } from "../services/correlation/correlation.engine";

const correlationRepo = new CorrelationRepository();
const correlationEngine = new CorrelationEngine();

export const listCorrelations = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await correlationRepo.listCorrelations();
    res.json({
      success: true,
      data: groups
    });
  } catch (err) {
    next(err);
  }
};

export const getCorrelationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await correlationRepo.findCorrelationById(req.params.id);
    res.json({
      success: true,
      data: group
    });
  } catch (err) {
    next(err);
  }
};

export const runCorrelation = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await correlationEngine.runCorrelation(60);
    res.json({
      success: true,
      data: created
    });
  } catch (err) {
    next(err);
  }
};
