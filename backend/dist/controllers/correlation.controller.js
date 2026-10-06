"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCorrelation = exports.getCorrelationById = exports.listCorrelations = void 0;
const correlation_repository_1 = require("../repositories/correlation.repository");
const correlation_engine_1 = require("../services/correlation/correlation.engine");
const correlationRepo = new correlation_repository_1.CorrelationRepository();
const correlationEngine = new correlation_engine_1.CorrelationEngine();
const listCorrelations = async (_req, res, next) => {
    try {
        const groups = await correlationRepo.listCorrelations();
        res.json({
            success: true,
            data: groups
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listCorrelations = listCorrelations;
const getCorrelationById = async (req, res, next) => {
    try {
        const group = await correlationRepo.findCorrelationById(req.params.id);
        res.json({
            success: true,
            data: group
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getCorrelationById = getCorrelationById;
const runCorrelation = async (_req, res, next) => {
    try {
        const created = await correlationEngine.runCorrelation(60);
        res.json({
            success: true,
            data: created
        });
    }
    catch (err) {
        next(err);
    }
};
exports.runCorrelation = runCorrelation;
