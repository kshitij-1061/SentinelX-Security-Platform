import { Request, Response, NextFunction } from "express";
import { AttackPathService } from "../services/attack-path/attack-path.service";

const pathService = new AttackPathService();

export const listAttackPaths = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const paths = await pathService.getAttackPaths();
    res.json({
      success: true,
      data: paths
    });
  } catch (err) {
    next(err);
  }
};

export const getAttackPathById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const path = await pathService.getAttackPathById(req.params.id);
    res.json({
      success: true,
      data: path
    });
  } catch (err) {
    next(err);
  }
};

export const getPathRiskAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const risk = await pathService.getPathRiskAssessment(req.params.id);
    res.json({
      success: true,
      data: risk
    });
  } catch (err) {
    next(err);
  }
};

export const analyzeAttackPaths = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paths = await pathService.analyzeAndBuildPaths(req.user?.id, req.ip, req.headers["user-agent"]);
    res.json({
      success: true,
      data: paths
    });
  } catch (err) {
    next(err);
  }
};
