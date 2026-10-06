"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDetectionRule = exports.createDetectionRule = exports.listDetectionRules = exports.updateAlertStatus = exports.getAlertById = exports.listAlerts = exports.getEventById = exports.listEvents = exports.ingestEvent = void 0;
const threat_service_1 = require("../services/threat.service");
const threat_schema_1 = require("../schemas/threat.schema");
const threatService = new threat_service_1.ThreatService();
const ingestEvent = async (req, res, next) => {
    try {
        const input = threat_schema_1.createEventSchema.parse(req.body);
        const result = await threatService.ingestEvent(input, req.user?.id, req.ip, req.headers["user-agent"]);
        res.status(201).json({
            success: true,
            data: result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.ingestEvent = ingestEvent;
const listEvents = async (req, res, next) => {
    try {
        const query = threat_schema_1.eventQuerySchema.parse(req.query);
        const result = await threatService.getEvents(query);
        res.json({
            success: true,
            data: result.events,
            meta: result.meta
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listEvents = listEvents;
const getEventById = async (req, res, next) => {
    try {
        const event = await threatService.getEventById(req.params.id);
        res.json({
            success: true,
            data: event
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getEventById = getEventById;
const listAlerts = async (req, res, next) => {
    try {
        const query = threat_schema_1.alertQuerySchema.parse(req.query);
        const result = await threatService.getAlerts(query);
        res.json({
            success: true,
            data: result.alerts,
            meta: result.meta
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listAlerts = listAlerts;
const getAlertById = async (req, res, next) => {
    try {
        const alert = await threatService.getAlertById(req.params.id);
        res.json({
            success: true,
            data: alert
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAlertById = getAlertById;
const updateAlertStatus = async (req, res, next) => {
    try {
        const input = threat_schema_1.updateAlertStatusSchema.parse(req.body);
        const alert = await threatService.updateAlertStatus(req.params.id, input.status, req.user?.id, req.ip, req.headers["user-agent"]);
        res.json({
            success: true,
            data: alert
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateAlertStatus = updateAlertStatus;
const listDetectionRules = async (_req, res, next) => {
    try {
        const rules = await threatService.getDetectionRules();
        res.json({
            success: true,
            data: rules
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listDetectionRules = listDetectionRules;
const createDetectionRule = async (req, res, next) => {
    try {
        const input = threat_schema_1.createDetectionRuleSchema.parse(req.body);
        const rule = await threatService.createDetectionRule(input, req.user?.id, req.ip, req.headers["user-agent"]);
        res.status(201).json({
            success: true,
            data: rule
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createDetectionRule = createDetectionRule;
const updateDetectionRule = async (req, res, next) => {
    try {
        const rule = await threatService.updateDetectionRule(req.params.id, req.body, req.user?.id, req.ip, req.headers["user-agent"]);
        res.json({
            success: true,
            data: rule
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateDetectionRule = updateDetectionRule;
