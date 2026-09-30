import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { seedDatabase } from "../src/db/seed";

describe("Attack Path & Risk Analysis Module (/api/v1/attack-paths)", () => {
  let analystToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();

    await request(app).post("/api/v1/auth/register").send({
      email: "pathanalyst@enterprise.lan",
      password: "AnalystPassword123!",
      fullName: "Path Analyst",
      roleName: "SECURITY_ANALYST"
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "pathanalyst@enterprise.lan",
      password: "AnalystPassword123!"
    });
    analystToken = loginRes.body.data.access_token;

    // Create an entry asset and target asset to build graph topology
    await request(app)
      .post("/api/v1/assets")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        hostname: "web-portal-01",
        ipAddress: "192.168.1.50",
        assetType: "SERVER",
        criticality: "MEDIUM",
        environment: "DMZ"
      });

    await request(app)
      .post("/api/v1/assets")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        hostname: "db-cluster-01",
        ipAddress: "10.0.0.100",
        assetType: "DATABASE",
        criticality: "CRITICAL",
        environment: "PRODUCTION"
      });
  });

  it("should trigger GraphAnalyzer to compute potential attack paths with risk scores", async () => {
    const res = await request(app)
      .post("/api/v1/attack-paths/analyze")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].riskScore).toBeGreaterThan(0);
    expect(res.body.data[0].nodes.length).toBeGreaterThan(1);
  });

  it("should retrieve calculated attack paths list", async () => {
    const res = await request(app)
      .get("/api/v1/attack-paths")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
