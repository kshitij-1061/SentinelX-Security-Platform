import { Request, Response, NextFunction } from "express";
import { AssetService } from "../services/asset.service";
import { 
  createAssetSchema, 
  updateAssetSchema, 
  assetQuerySchema, 
  importAssetSchema, 
  discoverySchema 
} from "../schemas/asset.schema";

const assetService = new AssetService();

export async function listAssets(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedQuery = assetQuerySchema.parse(req.query);
    const result = await assetService.getAssets(validatedQuery);
    res.status(200).json({
      success: true,
      data: result.items,
      meta: result.meta,
      message: "Asset inventory retrieved successfully."
    });
  } catch (err) {
    next(err);
  }
}

export async function getAssetMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = await assetService.getMetrics();
    res.status(200).json({
      success: true,
      data: metrics,
      message: "Asset metrics retrieved successfully."
    });
  } catch (err) {
    next(err);
  }
}

export async function getAssetById(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.getAssetById(req.params.id);
    res.status(200).json({
      success: true,
      data: asset,
      message: "Asset details retrieved successfully."
    });
  } catch (err) {
    next(err);
  }
}

export async function getAssetServices(req: Request, res: Response, next: NextFunction) {
  try {
    const services = await assetService.getServicesByAssetId(req.params.id);
    res.status(200).json({
      success: true,
      data: services,
      message: "Asset services retrieved successfully."
    });
  } catch (err) {
    next(err);
  }
}

export async function getAssetSoftware(req: Request, res: Response, next: NextFunction) {
  try {
    const software = await assetService.getSoftwareByAssetId(req.params.id);
    res.status(200).json({
      success: true,
      data: software,
      message: "Asset software packages retrieved successfully."
    });
  } catch (err) {
    next(err);
  }
}

export async function createAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedInput = createAssetSchema.parse(req.body);
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    const asset = await assetService.createAsset(validatedInput, userId, ipAddress, userAgent);
    res.status(201).json({
      success: true,
      data: asset,
      message: "Enterprise asset created successfully."
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedInput = updateAssetSchema.parse(req.body);
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    const updated = await assetService.updateAsset(req.params.id, validatedInput, userId, ipAddress, userAgent);
    res.status(200).json({
      success: true,
      data: updated,
      message: "Enterprise asset updated successfully."
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAsset(req: Request, res: Response, next: NextFunction) {
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
  } catch (err) {
    next(err);
  }
}

export async function importAssets(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedInput = importAssetSchema.parse(req.body);
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    const result = await assetService.importAssets(validatedInput, userId, ipAddress, userAgent);
    res.status(200).json({
      success: true,
      data: result,
      message: "Asset import process completed."
    });
  } catch (err) {
    next(err);
  }
}

export async function executeDiscovery(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedInput = discoverySchema.parse(req.body);
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    const result = await assetService.runDiscovery(validatedInput, userId, ipAddress, userAgent);
    res.status(200).json({
      success: true,
      data: result,
      message: "Controlled lab asset discovery execution completed."
    });
  } catch (err) {
    next(err);
  }
}
