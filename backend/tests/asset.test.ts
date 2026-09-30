import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { seedDatabase } from "../src/db/seed";

describe("Asset Discovery & Inventory Module (/api/v1/assets)", () => {
  let adminToken: string;
  let analystToken: string;
  let viewerToken: string;
  let createdAssetId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();

    // 1. Register Admin User
    await request(app).post("/api/v1/auth/register").send({
      email: "assetadmin@enterprise.lan",
      password: "AdminPassword123!",
      fullName: "Asset Admin",
      roleName: "ADMIN"
    });
    const adminLogin = await request(app).post("/api/v1/auth/login").send({
      email: "assetadmin@enterprise.lan",
      password: "AdminPassword123!"
    });
    adminToken = adminLogin.body.data.access_token;

    // 2. Register Analyst User
    await request(app).post("/api/v1/auth/register").send({
      email: "assetanalyst@enterprise.lan",
      password: "AnalystPassword123!",
      fullName: "Asset Analyst",
      roleName: "SECURITY_ANALYST"
    });
    const analystLogin = await request(app).post("/api/v1/auth/login").send({
      email: "assetanalyst@enterprise.lan",
      password: "AnalystPassword123!"
    });
    analystToken = analystLogin.body.data.access_token;

    // 3. Register Viewer User
    await request(app).post("/api/v1/auth/register").send({
      email: "assetviewer@enterprise.lan",
      password: "ViewerPassword123!",
      fullName: "Asset Viewer",
      roleName: "VIEWER"
    });
    const viewerLogin = await request(app).post("/api/v1/auth/login").send({
      email: "assetviewer@enterprise.lan",
      password: "ViewerPassword123!"
    });
    viewerToken = viewerLogin.body.data.access_token;
  });

  afterAll(async () => {
    await prisma.assetService.deleteMany();
    await prisma.assetSoftware.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("Asset Creation & Validation", () => {
    it("should allow security analyst to create a valid server asset with services and software", async () => {
      const assetPayload = {
        hostname: "WEB-APP-SEC-01",
        ipAddress: "192.168.1.150",
        macAddress: "00:11:22:33:44:55",
        assetType: "SERVER",
        operatingSystem: "Ubuntu Linux",
        operatingSystemVersion: "22.04 LTS",
        environment: "PRODUCTION",
        criticality: "HIGH",
        owner: "SecOps Team",
        department: "Cybersecurity",
        location: "Lab Rack C1",
        status: "ACTIVE",
        services: [
          { protocol: "TCP", port: 443, serviceName: "HTTPS", serviceVersion: "Nginx 1.24", status: "OPEN" }
        ],
        software: [
          { name: "Nginx", version: "1.24.0", vendor: "F5 Nginx" }
        ]
      };

      const res = await request(app)
        .post("/api/v1/assets")
        .set("Authorization", `Bearer ${analystToken}`)
        .send(assetPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hostname).toBe("WEB-APP-SEC-01");
      expect(res.body.data.services.length).toBe(1);
      expect(res.body.data.software.length).toBe(1);

      createdAssetId = res.body.data.id;
    });

    it("should reject asset creation with invalid IP address format", async () => {
      const invalidPayload = {
        hostname: "BAD-IP-HOST",
        ipAddress: "999.999.999.999",
        assetType: "SERVER"
      };

      const res = await request(app)
        .post("/api/v1/assets")
        .set("Authorization", `Bearer ${analystToken}`)
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject asset creation with invalid asset type", async () => {
      const invalidTypePayload = {
        hostname: "BAD-TYPE-HOST",
        ipAddress: "192.168.1.151",
        assetType: "INVALID_DEVICE_TYPE"
      };

      const res = await request(app)
        .post("/api/v1/assets")
        .set("Authorization", `Bearer ${analystToken}`)
        .send(invalidTypePayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject duplicate IP address creation", async () => {
      const duplicatePayload = {
        hostname: "DUPLICATE-HOST",
        ipAddress: "192.168.1.150",
        assetType: "WORKSTATION"
      };

      const res = await request(app)
        .post("/api/v1/assets")
        .set("Authorization", `Bearer ${analystToken}`)
        .send(duplicatePayload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("DUPLICATE_ASSET");
    });
  });

  describe("Asset Retrieval, Search & Filtering", () => {
    it("should list assets with search, filters, and pagination", async () => {
      const res = await request(app)
        .get("/api/v1/assets?search=WEB-APP&criticality=HIGH&page=1&limit=10")
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it("should retrieve single asset details by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/assets/${createdAssetId}`)
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdAssetId);
    });

    it("should return 404 for non-existent asset ID", async () => {
      const res = await request(app)
        .get("/api/v1/assets/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("Asset Updates & Deletion (RBAC Enforcement)", () => {
    it("should allow security analyst to update asset metadata", async () => {
      const updatePayload = {
        criticality: "CRITICAL",
        owner: "SOC Incident Handler"
      };

      const res = await request(app)
        .patch(`/api/v1/assets/${createdAssetId}`)
        .set("Authorization", `Bearer ${analystToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.data.criticality).toBe("CRITICAL");
      expect(res.body.data.owner).toBe("SOC Incident Handler");
    });

    it("should DENY asset deletion to security analyst (ASSET_DELETE requires Admin)", async () => {
      const res = await request(app)
        .delete(`/api/v1/assets/${createdAssetId}`)
        .set("Authorization", `Bearer ${analystToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should ALLOW asset deletion to system admin", async () => {
      const res = await request(app)
        .delete(`/api/v1/assets/${createdAssetId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Asset Bulk Import & Discovery Probes", () => {
    it("should process bulk JSON asset import with record validation", async () => {
      const importPayload = {
        records: [
          {
            hostname: "IMPORT-DB-01",
            ipAddress: "192.168.1.180",
            assetType: "DATABASE",
            criticality: "HIGH",
            status: "ACTIVE"
          },
          {
            hostname: "IMPORT-FW-01",
            ipAddress: "192.168.1.181",
            assetType: "NETWORK_DEVICE",
            criticality: "CRITICAL",
            status: "ACTIVE"
          }
        ]
      };

      const res = await request(app)
        .post("/api/v1/assets/import")
        .set("Authorization", `Bearer ${analystToken}`)
        .send(importPayload);

      expect(res.status).toBe(200);
      expect(res.body.data.totalRecords).toBe(2);
      expect(res.body.data.successfulRecords).toBe(2);
      expect(res.body.data.failedRecords).toBe(0);
    });

    it("should execute controlled lab discovery and populate lab assets", async () => {
      const res = await request(app)
        .post("/api/v1/assets/discovery")
        .set("Authorization", `Bearer ${analystToken}`)
        .send({
          provider: "MOCK",
          targetSubnet: "192.168.1.0/24"
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalDiscovered).toBeGreaterThanOrEqual(5);
    });

    it("should REJECT discovery probe directed at public internet IP range", async () => {
      const res = await request(app)
        .post("/api/v1/assets/discovery")
        .set("Authorization", `Bearer ${analystToken}`)
        .send({
          provider: "MOCK",
          targetSubnet: "8.8.8.0/24"
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("FORBIDDEN_SCAN_TARGET");
    });
  });

  describe("Audit Trail Generation for Assets", () => {
    it("should record ASSET_CREATE and ASSET_DISCOVERY_EXECUTE in audit logs", async () => {
      const res = await request(app)
        .get("/api/v1/audit-logs")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const actions = res.body.data.map((l: any) => l.action);
      expect(actions).toContain("ASSET_CREATE");
      expect(actions).toContain("ASSET_DISCOVERY_EXECUTE");
    });
  });
});
