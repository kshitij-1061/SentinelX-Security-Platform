"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAssets = listAssets;
exports.getAssetMetrics = getAssetMetrics;
exports.getAssetById = getAssetById;
exports.getAssetServices = getAssetServices;
exports.getAssetSoftware = getAssetSoftware;
exports.createAsset = createAsset;
exports.updateAsset = updateAsset;
exports.deleteAsset = deleteAsset;
exports.importAssets = importAssets;
exports.executeDiscovery = executeDiscovery;
const asset_service_1 = require("../services/asset.service");
const asset_schema_1 = require("../schemas/asset.schema");
const assetService = new asset_service_1.AssetService();
async function listAssets(req, res, next) {
    try {
        const validatedQuery = asset_schema_1.assetQuerySchema.parse(req.query);
        const result = await assetService.getAssets(validatedQuery);
        res.status(200).json({
            success: true,
            data: result.items,
            meta: result.meta,
            message: "Asset inventory retrieved successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
async function getAssetMetrics(req, res, next) {
    try {
        const metrics = await assetService.getMetrics();
        res.status(200).json({
            success: true,
            data: metrics,
            message: "Asset metrics retrieved successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
async function getAssetById(req, res, next) {
    try {
        const asset = await assetService.getAssetById(req.params.id);
        res.status(200).json({
            success: true,
            data: asset,
            message: "Asset details retrieved successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
async function getAssetServices(req, res, next) {
    try {
        const services = await assetService.getServicesByAssetId(req.params.id);
        res.status(200).json({
            success: true,
            data: services,
            message: "Asset services retrieved successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
async function getAssetSoftware(req, res, next) {
    try {
        const software = await assetService.getSoftwareByAssetId(req.params.id);
        res.status(200).json({
            success: true,
            data: software,
            message: "Asset software packages retrieved successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
async function createAsset(req, res, next) {
    try {
        const validatedInput = asset_schema_1.createAssetSchema.parse(req.body);
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers["user-agent"];
        const asset = await assetService.createAsset(validatedInput, userId, ipAddress, userAgent);
        res.status(201).json({
            success: true,
            data: asset,
            message: "Enterprise asset created successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
async function updateAsset(req, res, next) {
    try {
        const validatedInput = asset_schema_1.updateAssetSchema.parse(req.body);
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers["user-agent"];
        const updated = await assetService.updateAsset(req.params.id, validatedInput, userId, ipAddress, userAgent);
        res.status(200).json({
            success: true,
            data: updated,
            message: "Enterprise asset updated successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
async function deleteAsset(req, res, next) {
    try {
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers["user-agent"];
        const result = await assetService.deleteAsset(req.params.id, userId, ipAddress, userAgent);
        res.status(200).json({
            success: true,
            data: result,
            message: "Enterprise asset deleted successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
async function importAssets(req, res, next) {
    try {
        const validatedInput = asset_schema_1.importAssetSchema.parse(req.body);
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers["user-agent"];
        const result = await assetService.importAssets(validatedInput, userId, ipAddress, userAgent);
        res.status(200).json({
            success: true,
            data: result,
            message: "Asset import process completed."
        });
    }
    catch (err) {
        next(err);
    }
}
async function executeDiscovery(req, res, next) {
    try {
        const validatedInput = asset_schema_1.discoverySchema.parse(req.body);
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers["user-agent"];
        const result = await assetService.runDiscovery(validatedInput, userId, ipAddress, userAgent);
        res.status(200).json({
            success: true,
            data: result,
            message: "Controlled lab asset discovery execution completed."
        });
    }
    catch (err) {
        next(err);
    }
}
