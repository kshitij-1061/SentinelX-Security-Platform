"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeAttackPaths = exports.getPathRiskAssessment = exports.getAttackPathById = exports.listAttackPaths = void 0;
const attack_path_service_1 = require("../services/attack-path/attack-path.service");
const pathService = new attack_path_service_1.AttackPathService();
const listAttackPaths = async (_req, res, next) => {
    try {
        const paths = await pathService.getAttackPaths();
        res.json({
            success: true,
            data: paths
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listAttackPaths = listAttackPaths;
const getAttackPathById = async (req, res, next) => {
    try {
        const path = await pathService.getAttackPathById(req.params.id);
        res.json({
            success: true,
            data: path
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAttackPathById = getAttackPathById;
const getPathRiskAssessment = async (req, res, next) => {
    try {
        const risk = await pathService.getPathRiskAssessment(req.params.id);
        res.json({
            success: true,
            data: risk
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getPathRiskAssessment = getPathRiskAssessment;
const analyzeAttackPaths = async (req, res, next) => {
    try {
        const paths = await pathService.analyzeAndBuildPaths(req.user?.id, req.ip, req.headers["user-agent"]);
        res.json({
            success: true,
            data: paths
        });
    }
    catch (err) {
        next(err);
    }
};
exports.analyzeAttackPaths = analyzeAttackPaths;
