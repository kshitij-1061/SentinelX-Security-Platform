import { Asset, Vulnerability } from "@prisma/client";

export interface VulnerabilityScanMatch {
  cve?: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  cvssScore: number;
  affectedSoftware: string;
  affectedVersion: string;
  detectedVersion: string;
  remediation: string;
}

export interface VulnerabilityScanResult {
  assetId: string;
  scannedAt: Date;
  matches: VulnerabilityScanMatch[];
}

export interface IVulnerabilityScannerProvider {
  name: string;
  scanAsset(asset: Asset & { software?: any[] }): Promise<VulnerabilityScanResult>;
}
