"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalSearch = exports.getDashboardAnalytics = exports.getDashboardSummary = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const dashService = new dashboard_service_1.DashboardService();
const getDashboardSummary = async (_req, res, next) => {
    try {
        const summary = await dashService.getSummary();
        res.json({
            success: true,
            data: summary
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getDashboardSummary = getDashboardSummary;
const getDashboardAnalytics = async (_req, res, next) => {
    try {
        const analytics = await dashService.getAnalytics();
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
const globalSearch = async (req, res, next) => {
    try {
        const q = req.query.q;
        const results = await dashService.globalSearch(q);
        res.json({
            success: true,
            data: results
        });
    }
    catch (err) {
        next(err);
    }
};
exports.globalSearch = globalSearch;
