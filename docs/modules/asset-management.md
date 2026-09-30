# Asset Discovery & Inventory Module

## Overview

The **Asset Discovery & Inventory** module forms the baseline operational layer of the Enterprise Cyber Defense Platform. It discovers, categorizes, tracks, and inventories network hosts, servers, workstations, cloud instances, network infrastructure, database servers, and security appliances across enterprise environments.

---

## Key Features

1. **Enterprise Asset Data Model**
   - Tracks hostnames, IP addresses, MAC addresses, operating systems, asset types, criticality levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), environments (`PRODUCTION`, `STAGING`, `DEVELOPMENT`, `LAB`), owners, departments, and geolocation/zone metadata.
   - Relational mapping to open network services (`AssetService`) and installed software packages (`AssetSoftware`).

2. **Controlled Discovery Engine (`IDiscoveryProvider`)**
   - Pluggable provider pattern designed for extensible integration (e.g. Nmap, Cloud API, Active Directory).
   - Includes `MockDiscoveryProvider` for deterministic, safe lab environment simulations.
   - Built-in **Safety Enforcement Guard**: Blocks scans against public subnets (e.g., `8.8.8.8`) returning a strictly handled `FORBIDDEN_SCAN_TARGET` error. Scans are restricted exclusively to RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`).

3. **Bulk JSON Import Pipeline**
   - Supports bulk asset ingestion via structured JSON payloads.
   - Automatic record normalization, default assignment, duplicate IP handling, and batch persistence.

4. **Metrics & Inventory Analytics**
   - Dynamic server-side aggregation for active asset counts, high/critical severity breakdown, environment distributions, and asset type ratios.

5. **RBAC & Audit Logging**
   - All asset queries require `ASSET_READ`.
   - Creation requires `ASSET_CREATE`, modifications require `ASSET_UPDATE`, deletions require `ASSET_DELETE`.
   - Discovery probes and JSON imports require `ASSET_DISCOVER`.
   - Every mutation and probe generates an immutable audit record in the `AuditLog` table.

---

## Data Schema Summary

### `Asset`
| Field | Type | Description |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `hostname` | String | Unique network hostname |
| `ipAddress` | String | IPv4 address (indexed) |
| `macAddress` | String? | Physical address |
| `assetType` | Enum | `SERVER`, `WORKSTATION`, `ROUTER`, `SWITCH`, `FIREWALL`, `DATABASE`, `CLOUD_INSTANCE` |
| `operatingSystem` | String? | Operating system name |
| `operatingSystemVersion` | String? | OS version string |
| `environment` | Enum | `PRODUCTION`, `STAGING`, `DEVELOPMENT`, `LAB` |
| `criticality` | Enum | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `status` | Enum | `ACTIVE`, `INACTIVE`, `DECOMMISSIONED` |
| `owner` | String? | Asset owner email or identifier |
| `department` | String? | Owning business unit |
| `location` | String? | Physical location or datacenter zone |
| `lastSeen` | DateTime | Last scan / ping timestamp |
| `createdAt` | DateTime | First record timestamp |
| `updatedAt` | DateTime | Last mutation timestamp |

---

## REST API Reference

### `GET /api/v1/assets`
Returns a paginated list of assets filtered by `search`, `assetType`, `criticality`, `status`, or `environment`.
- **Permission:** `ASSET_READ`

### `GET /api/v1/assets/metrics`
Returns summary metrics (total assets, active count, critical count, breakdown by type and environment).
- **Permission:** `ASSET_READ`

### `GET /api/v1/assets/:id`
Returns detailed asset entity including attached network services and software inventory.
- **Permission:** `ASSET_READ`

### `POST /api/v1/assets`
Creates a new asset entity with optional initial services and software array.
- **Permission:** `ASSET_CREATE`

### `PATCH /api/v1/assets/:id`
Updates an existing asset's attributes.
- **Permission:** `ASSET_UPDATE`

### `DELETE /api/v1/assets/:id`
Deletes an asset record.
- **Permission:** `ASSET_DELETE`

### `POST /api/v1/assets/import`
Ingests a JSON array of asset records.
- **Permission:** `ASSET_DISCOVER`

### `POST /api/v1/assets/discovery`
Executes an asset probe against a private IP subnet.
- **Permission:** `ASSET_DISCOVER`
- **Request Body:**
  ```json
  {
    "provider": "MOCK",
    "targetSubnet": "192.168.1.0/24"
  }
  ```

---

## Safety Enforcement Guard

Scanning public IP ranges without explicit written authorization is illegal and dangerous. The platform enforces an IP validation guard in `MockDiscoveryProvider`:

```typescript
const isPrivateIp = (ip: string): boolean => {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;
  return false;
};
```

Attempts to probe subnets outside RFC 1918 range throw:
`AppError(400, "FORBIDDEN_SCAN_TARGET", "Discovery probes on public subnets are strictly forbidden.")`.
