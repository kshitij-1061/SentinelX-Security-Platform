export interface DiscoveredService {
  protocol: string;
  port: number;
  serviceName: string;
  serviceVersion?: string;
  status: string;
}

export interface DiscoveredSoftware {
  name: string;
  version: string;
  vendor?: string;
}

export interface DiscoveredAsset {
  hostname: string;
  ipAddress: string;
  macAddress?: string;
  assetType: "SERVER" | "WORKSTATION" | "NETWORK_DEVICE" | "DATABASE" | "APPLICATION" | "CONTAINER" | "CLOUD_RESOURCE" | "HONEY_POT";
  operatingSystem?: string;
  operatingSystemVersion?: string;
  environment?: string;
  criticality: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  owner?: string;
  department?: string;
  location?: string;
  status: "ACTIVE" | "INACTIVE" | "UNKNOWN";
  services: DiscoveredService[];
  software: DiscoveredSoftware[];
}

export interface DiscoveryConfig {
  provider: "MOCK" | "MANUAL" | "LAB_PROBE";
  targetSubnet?: string;
}

export interface AssetDiscoveryProvider {
  discover(config: DiscoveryConfig): Promise<DiscoveredAsset[]>;
}
