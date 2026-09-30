import { AssetRepository } from "../repositories/asset.repository";
import { AuditService } from "./audit.service";
import { MockDiscoveryProvider } from "./discovery/mock.discovery";
import { 
  CreateAssetInput, 
  UpdateAssetInput, 
  AssetQueryInput, 
  ImportAssetInput, 
  DiscoveryInput,
  importAssetItemSchema
} from "../schemas/asset.schema";
import { AppError } from "../middleware/error.middleware";

export class AssetService {
  private assetRepo: AssetRepository;
  private auditService: AuditService;

  constructor() {
    this.assetRepo = new AssetRepository();
    this.auditService = new AuditService();
  }

  async getAssets(query: AssetQueryInput) {
    return this.assetRepo.listWithFilters(query);
  }

  async getAssetById(id: string) {
    const asset = await this.assetRepo.findById(id);
    if (!asset) {
      throw new AppError(`Asset with ID '${id}' not found.`, 404, "NOT_FOUND");
    }
    return asset;
  }

  async getServicesByAssetId(id: string) {
    const asset = await this.getAssetById(id);
    return asset.services;
  }

  async getSoftwareByAssetId(id: string) {
    const asset = await this.getAssetById(id);
    return asset.software;
  }

  async createAsset(input: CreateAssetInput, userId?: string, ipAddress?: string, userAgent?: string) {
    const existingIp = await this.assetRepo.findByIp(input.ipAddress);
    if (existingIp) {
      throw new AppError(`Asset with IP address '${input.ipAddress}' already exists.`, 400, "DUPLICATE_ASSET");
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

  async updateAsset(id: string, input: UpdateAssetInput, userId?: string, ipAddress?: string, userAgent?: string) {
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

  async deleteAsset(id: string, userId?: string, ipAddress?: string, userAgent?: string) {
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

  async importAssets(input: ImportAssetInput, userId?: string, ipAddress?: string, userAgent?: string) {
    let successfulRecords = 0;
    let failedRecords = 0;
    const errors: Array<{ index: number; hostname?: string; ipAddress?: string; error: string }> = [];

    for (let i = 0; i < input.records.length; i++) {
      const record = input.records[i];
      const parsed = importAssetItemSchema.safeParse(record);

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
        } else {
          await this.assetRepo.create({
            ...parsed.data,
            environment: parsed.data.environment || "PRODUCTION"
          });
          successfulRecords++;
        }
      } catch (err: any) {
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

  async runDiscovery(input: DiscoveryInput, userId?: string, ipAddress?: string, userAgent?: string) {
    const provider = new MockDiscoveryProvider();
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
      } else {
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
