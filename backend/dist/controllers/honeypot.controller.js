"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHoneypotSessions = exports.listHoneypotEvents = exports.ingestHoneypotEvent = exports.updateHoneypot = exports.createHoneypot = exports.getHoneypotById = exports.listHoneypots = void 0;
const honeypot_service_1 = require("../services/deception/honeypot.service");
const honeypot_schema_1 = require("../schemas/honeypot.schema");
const hpService = new honeypot_service_1.HoneypotService();
const listHoneypots = async (_req, res, next) => {
    try {
        const honeypots = await hpService.getHoneypots();
        res.json({
            success: true,
            data: honeypots
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listHoneypots = listHoneypots;
const getHoneypotById = async (req, res, next) => {
    try {
        const hp = await hpService.getHoneypotById(req.params.id);
        res.json({
            success: true,
            data: hp
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getHoneypotById = getHoneypotById;
const createHoneypot = async (req, res, next) => {
    try {
        const input = honeypot_schema_1.createHoneypotSchema.parse(req.body);
        const hp = await hpService.createHoneypot(input, req.user?.id, req.ip, req.headers["user-agent"]);
        res.status(201).json({
            success: true,
            data: hp
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createHoneypot = createHoneypot;
const updateHoneypot = async (req, res, next) => {
    try {
        const input = honeypot_schema_1.updateHoneypotSchema.parse(req.body);
        const hp = await hpService.updateHoneypot(req.params.id, input, req.user?.id, req.ip, req.headers["user-agent"]);
        res.json({
            success: true,
            data: hp
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateHoneypot = updateHoneypot;
const ingestHoneypotEvent = async (req, res, next) => {
    try {
        const input = honeypot_schema_1.ingestHoneypotEventSchema.parse(req.body);
        const result = await hpService.ingestHoneypotEvent(input, req.user?.id, req.ip, req.headers["user-agent"]);
        res.status(201).json({
            success: true,
            data: result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.ingestHoneypotEvent = ingestHoneypotEvent;
const listHoneypotEvents = async (_req, res, next) => {
    try {
        const events = await hpService.getHoneypotEvents();
        res.json({
            success: true,
            data: events
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listHoneypotEvents = listHoneypotEvents;
const getHoneypotSessions = async (req, res, next) => {
    try {
        const sessions = await hpService.getHoneypotSessions(req.params.id);
        res.json({
            success: true,
            data: sessions
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getHoneypotSessions = getHoneypotSessions;
