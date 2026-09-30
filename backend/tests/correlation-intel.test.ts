import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { seedDatabase } from "../src/db/seed";

describe("Alert Correlation & Threat Intelligence Module (/api/v1/correlations & /api/v1/threat-intelligence)", () => {
  let analystToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();

    await request(app).post("/api/v1/auth/register").send({
      email: "intelanalyst@enterprise.lan",
      password: "AnalystPassword123!",
      fullName: "Intel Analyst",
      roleName: "SECURITY_ANALYST"
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "intelanalyst@enterprise.lan",
      password: "AnalystPassword123!"
    });
    analystToken = loginRes.body.data.access_token;
  });

  it("should correlate alerts into explainable correlation groups", async () => {
    await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        source: "GENERIC_JSON",
        eventType: "SSH_BRUTEFORCE",
        sourceIP: "192.168.10.50",
        destinationIP: "10.0.0.5",
        rawPayload: {
          timestamp: new Date().toISOString(),
          sourceIP: "192.168.10.50",
          destinationIP: "10.0.0.5",
          eventType: "SSH_BRUTEFORCE",
          username: "admin"
        }
      });

    const correlateRes = await request(app)
      .post("/api/v1/correlations/run")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(correlateRes.status).toBe(200);
    expect(correlateRes.body.success).toBe(true);

    const listRes = await request(app)
      .get("/api/v1/correlations")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
  });

  it("should lookup threat intelligence IOC details via enrich endpoint", async () => {
    const res = await request(app)
      .get("/api/v1/threat-intelligence/enrich?ioc=198.51.100.45")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.iocValue).toBe("198.51.100.45");
    expect(res.body.data.matched).toBe(true);
  });

  it("should list MITRE ATT&CK techniques", async () => {
    const res = await request(app)
      .get("/api/v1/techniques")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].techniqueId).toBeDefined();
  });
});
