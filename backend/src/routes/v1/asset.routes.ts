import { Router } from "express";
import { 
  listAssets, 
  getAssetMetrics,
  getAssetById, 
  getAssetServices, 
  getAssetSoftware, 
  createAsset, 
  updateAsset, 
  deleteAsset, 
  importAssets, 
  executeDiscovery 
} from "../../controllers/asset.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

router.get("/", requirePermission("ASSET_READ"), listAssets);
router.get("/metrics", requirePermission("ASSET_READ"), getAssetMetrics);
router.post("/", requirePermission("ASSET_CREATE"), createAsset);
router.post("/import", requirePermission("ASSET_DISCOVER"), importAssets);
router.post("/discovery", requirePermission("ASSET_DISCOVER"), executeDiscovery);
router.get("/:id", requirePermission("ASSET_READ"), getAssetById);
router.patch("/:id", requirePermission("ASSET_UPDATE"), updateAsset);
router.delete("/:id", requirePermission("ASSET_DELETE"), deleteAsset);
router.get("/:id/services", requirePermission("ASSET_READ"), getAssetServices);
router.get("/:id/software", requirePermission("ASSET_READ"), getAssetSoftware);

export default router;
