import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";

const dashService = new DashboardService();

export const getDashboardSummary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await dashService.getSummary();
    res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

export const getDashboardAnalytics = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await dashService.getAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    next(err);
  }
};

export const globalSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    const results = await dashService.globalSearch(q);
    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    next(err);
  }
};
