"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTechniqueById = exports.listTechniques = exports.enrichIoc = exports.createIndicator = exports.getIndicatorById = exports.listIndicators = void 0;
const threat_intel_service_1 = require("../services/threat-intel/threat-intel.service");
const mitre_service_1 = require("../services/threat-intel/mitre.service");
const correlation_schema_1 = require("../schemas/correlation.schema");
const tiService = new threat_intel_service_1.ThreatIntelService();
const mitreService = new mitre_service_1.MitreService();
const listIndicators = async (req, res, next) => {
    try {
        const indicators = await tiService.getIndicators(req.query.type);
        res.json({
            success: true,
            data: indicators
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listIndicators = listIndicators;
const getIndicatorById = async (req, res, next) => {
    try {
        const indicator = await tiService.getIndicatorByValue(req.params.id);
        res.json({
            success: true,
            data: indicator
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getIndicatorById = getIndicatorById;
const createIndicator = async (req, res, next) => {
    try {
        const input = correlation_schema_1.createThreatIndicatorSchema.parse(req.body);
        const indicator = await tiService.createIndicator(input, req.user?.id, req.ip, req.headers["user-agent"]);
        res.status(201).json({
            success: true,
            data: indicator
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createIndicator = createIndicator;
const enrichIoc = async (req, res, next) => {
    try {
        const result = await tiService.enrichIoc(req.query.ioc);
        res.json({
            success: true,
            data: result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.enrichIoc = enrichIoc;
const listTechniques = async (_req, res, next) => {
    try {
        const techniques = await mitreService.getTechniques();
        res.json({
            success: true,
            data: techniques
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listTechniques = listTechniques;
const getTechniqueById = async (req, res, next) => {
    try {
        const technique = await mitreService.getTechniqueById(req.params.id);
        res.json({
            success: true,
            data: technique
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getTechniqueById = getTechniqueById;
