"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeResponseAction = exports.addNote = exports.addEvidence = exports.getIncidentTimeline = exports.updateIncident = exports.createIncident = exports.getIncidentById = exports.listIncidents = void 0;
const incident_service_1 = require("../services/incident.service");
const incident_schema_1 = require("../schemas/incident.schema");
const incService = new incident_service_1.IncidentService();
const listIncidents = async (req, res, next) => {
    try {
        const incidents = await incService.getIncidents(req.query);
        res.json({
            success: true,
            data: incidents
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listIncidents = listIncidents;
const getIncidentById = async (req, res, next) => {
    try {
        const incident = await incService.getIncidentById(req.params.id);
        res.json({
            success: true,
            data: incident
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getIncidentById = getIncidentById;
const createIncident = async (req, res, next) => {
    try {
        const input = incident_schema_1.createIncidentSchema.parse(req.body);
        const incident = await incService.createIncident(input, req.user?.id, req.ip, req.headers["user-agent"]);
        res.status(201).json({
            success: true,
            data: incident
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createIncident = createIncident;
const updateIncident = async (req, res, next) => {
    try {
        const input = incident_schema_1.updateIncidentSchema.parse(req.body);
        const incident = await incService.updateIncident(req.params.id, input, req.user?.id, req.ip, req.headers["user-agent"]);
        res.json({
            success: true,
            data: incident
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateIncident = updateIncident;
const getIncidentTimeline = async (req, res, next) => {
    try {
        const timeline = await incService.getIncidentTimeline(req.params.id);
        res.json({
            success: true,
            data: timeline
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getIncidentTimeline = getIncidentTimeline;
const addEvidence = async (req, res, next) => {
    try {
        const input = incident_schema_1.addEvidenceSchema.parse(req.body);
        const analystName = req.user?.email || "SOC Analyst";
        const evidence = await incService.addEvidence(req.params.id, input, analystName, req.user?.id, req.ip, req.headers["user-agent"]);
        res.status(201).json({
            success: true,
            data: evidence
        });
    }
    catch (err) {
        next(err);
    }
};
exports.addEvidence = addEvidence;
const addNote = async (req, res, next) => {
    try {
        const input = incident_schema_1.addNoteSchema.parse(req.body);
        const analystName = req.user?.email || "SOC Analyst";
        const note = await incService.addNote(req.params.id, input, analystName, req.user?.id, req.ip, req.headers["user-agent"]);
        res.status(201).json({
            success: true,
            data: note
        });
    }
    catch (err) {
        next(err);
    }
};
exports.addNote = addNote;
const executeResponseAction = async (req, res, next) => {
    try {
        const input = incident_schema_1.executeResponseActionSchema.parse(req.body);
        const analystName = req.user?.email || "SOC Analyst";
        const result = await incService.executeResponseAction(req.params.id, input, analystName, req.user?.id, req.ip, req.headers["user-agent"]);
        res.json({
            success: true,
            data: result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.executeResponseAction = executeResponseAction;
