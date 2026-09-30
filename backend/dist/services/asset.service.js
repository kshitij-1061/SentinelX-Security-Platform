"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetService = void 0;
const asset_repository_1 = require("../repositories/asset.repository");
const audit_service_1 = require("./audit.service");
const mock_discovery_1 = require("./discovery/mock.discovery");
const asset_schema_1 = require("../schemas/asset.schema");
const error_middleware_1 = require("../middleware/error.middleware");
class AssetService {
    assetRepo;
    auditService;
    constructor() {
        this.assetRepo = new asset_repository_1.AssetRepository();
        this.auditService = new audit_service_1.AuditService();
    }
    async getAssets(query) {
        return this.assetRepo.listWithFilters(query);
    }
    async getAssetById(id) {
        const asset = await this.assetRepo.findById(id);
        if (!asset) {
            throw new error_middleware_1.AppError(`Asset with ID '${id}' not found.`, 404, "NOT_FOUND");
        }
        return asset;
    }
    async getServicesByAssetId(id) {
        const asset = await this.getAssetById(id);
        return asset.services;
    }
    async getSoftwareByAssetId(id) {
        const asset = await this.getAssetById(id);
        return asset.software;
    }
    async createAsset(input, userId, ipAddress, userAgent) {
        const existingIp = await this.assetRepo.findByIp(input.ipAddress);
        if (existingIp) {
            throw new error_middleware_1.AppError(`Asset with IP address '${input.ipAddress}' already exists.`, 400, "DUPLICATE_ASSET");
        }
        const asset = await this.assetRepo.create(input);
        await this.auditService.logEvent({
            action: "ASSET_CREATE",
            status: "SUCCESS",
            userId,
            resource: "Asset",
            resourceId: asset.id,
            ipAddress,
            userAgent,
            metadata: { hostname: asset.hostname, ipAddress: asset.ipAddress, criticality: asset.criticality }
        });
        return asset;
    }
    async updateAsset(id, input, userId, ipAddress, userAgent) {
        await this.getAssetById(id);
        const updated = await this.assetRepo.update(id, input);
        await this.auditService.logEvent({
            action: "ASSET_UPDATE",
            status: "SUCCESS",
            userId,
            resource: "Asset",
            resourceId: updated.id,
            ipAddress,
            userAgent,
            metadata: { hostname: updated.hostname, updatedFields: Object.keys(input) }
        });
        return updated;
    }
    async deleteAsset(id, userId, ipAddress, userAgent) {
        const asset = await this.getAssetById(id);
        await this.assetRepo.delete(id);
        await this.auditService.logEvent({
            action: "ASSET_DELETE",
            status: "SUCCESS",
            userId,
            resource: "Asset",
            resourceId: id,
            ipAddress,
            userAgent,
            metadata: { hostname: asset.hostname, ipAddress: asset.ipAddress }
        });
        return { id, message: "Asset successfully deleted" };
    }
    async importAssets(input, userId, ipAddress, userAgent) {
        let successfulRecords = 0;
        let failedRecords = 0;
        const errors = [];
        for (let i = 0; i < input.records.length; i++) {
            const record = input.records[i];
            const parsed = asset_schema_1.importAssetItemSchema.safeParse(record);
            if (!parsed.success) {
                failedRecords++;
                errors.push({
                    index: i,
                    hostname: record.hostname,
                    ipAddress: record.ipAddress,
                    error: parsed.error.errors.map((e) => e.message).join(", ")
                });
                continue;
            }
            try {
                const existing = await this.assetRepo.findByIp(parsed.data.ipAddress);
                if (existing) {
                    await this.assetRepo.update(existing.id, {
                        status: parsed.data.status,
                        operatingSystem: parsed.data.operatingSystem || existing.operatingSystem || undefined,
                        criticality: parsed.data.criticality
                    });
                    successfulRecords++;
                }
                else {
                    await this.assetRepo.create({
                        ...parsed.data,
                        environment: parsed.data.environment || "PRODUCTION"
                    });
                    successfulRecords++;
                }
            }
            catch (err) {
                failedRecords++;
                errors.push({
                    index: i,
                    hostname: record.hostname,
                    ipAddress: record.ipAddress,
                    error: err.message || "Import database error"
                });
            }
        }
        await this.auditService.logEvent({
            action: "ASSET_IMPORT",
            status: failedRecords === 0 ? "SUCCESS" : "PARTIAL_SUCCESS",
            userId,
            ipAddress,
            userAgent,
            metadata: { total: input.records.length, successful: successfulRecords, failed: failedRecords }
        });
        return {
            totalRecords: input.records.length,
            successfulRecords,
            failedRecords,
            errors
        };
    }
    async runDiscovery(input, userId, ipAddress, userAgent) {
        const provider = new mock_discovery_1.MockDiscoveryProvider();
        const discoveredAssets = await provider.discover({
            provider: input.provider,
            targetSubnet: input.targetSubnet
        });
        let newDiscoveredCount = 0;
        let updatedDiscoveredCount = 0;
        for (const discovered of discoveredAssets) {
            const existing = await this.assetRepo.findByIp(discovered.ipAddress);
            if (existing) {
                await this.assetRepo.update(existing.id, {
                    status: "ACTIVE",
                    operatingSystem: discovered.operatingSystem,
                    operatingSystemVersion: discovered.operatingSystemVersion
                });
                updatedDiscoveredCount++;
            }
            else {
                await this.assetRepo.create({
                    ...discovered,
                    environment: discovered.environment || "PRODUCTION"
                });
                newDiscoveredCount++;
            }
        }
        await this.auditService.logEvent({
            action: "ASSET_DISCOVERY_EXECUTE",
            status: "SUCCESS",
            userId,
            ipAddress,
            userAgent,
            metadata: {
                provider: input.provider,
                targetSubnet: input.targetSubnet,
                totalDiscovered: discoveredAssets.length,
                newAssets: newDiscoveredCount,
                updatedAssets: updatedDiscoveredCount
            }
        });
        return {
            provider: input.provider,
            targetSubnet: input.targetSubnet,
            totalDiscovered: discoveredAssets.length,
            newAssetsCreated: newDiscoveredCount,
            existingAssetsUpdated: updatedDiscoveredCount,
            discoveredAssets
        };
    }
    async getMetrics() {
        return this.assetRepo.getMetrics();
    }
}
exports.AssetService = AssetService;
