import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { seedDatabase } from "../src/db/seed";

describe("Threat & Network Detection Module (/api/v1/events & /api/v1/detection-rules)", () => {
  let analystToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();

    await request(app).post("/api/v1/auth/register").send({
      email: "threatanalyst@enterprise.lan",
      password: "AnalystPassword123!",
      fullName: "Threat Analyst",
      roleName: "SECURITY_ANALYST"
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "threatanalyst@enterprise.lan",
      password: "AnalystPassword123!"
    });
    analystToken = loginRes.body.data.access_token;
  });

  it("should ingest raw event and normalize it via generic adapter", async () => {
    const res = await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        source: "GENERIC_JSON",
        eventType: "SSH_BRUTEFORCE",
        sourceIP: "192.168.1.105",
        destinationIP: "10.0.0.50",
        rawPayload: {
          timestamp: new Date().toISOString(),
          source_ip: "192.168.1.105",
          destination_ip: "10.0.0.50",
          event_type: "SSH_BRUTEFORCE",
          username: "admin",
          process: "sshd"
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.event.eventType).toBe("SSH_BRUTEFORCE");
    expect(res.body.data.event.sourceIP).toBe("192.168.1.105");
  });

  it("should list ingested security events with filtering", async () => {
    const res = await request(app)
      .get("/api/v1/events")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should list active detection rules", async () => {
    const res = await request(app)
      .get("/api/v1/detection-rules")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should create custom detection rule and trigger alert on matching event", async () => {
    const ruleRes = await request(app)
      .post("/api/v1/detection-rules")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        name: "Test PowerShell Execution",
        description: "Detects unauthorized powershell execution",
        severity: "HIGH",
        source: "SIGMA",
        ruleDefinition: JSON.stringify({ field: "command", value: "powershell", operator: "contains" }),
        mitreTechnique: "T1059.001"
      });

    expect(ruleRes.status).toBe(201);

    const ingestRes = await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        source: "SYSLOG",
        eventType: "PROCESS_CREATION",
        sourceIP: "10.0.0.99",
        destinationIP: "10.0.0.50",
        process: "powershell.exe",
        command: "powershell -ExecutionPolicy Bypass",
        rawPayload: {
          timestamp: new Date().toISOString(),
          process: "powershell.exe",
          command: "powershell -ExecutionPolicy Bypass"
        }
      });

    expect(ingestRes.status).toBe(201);
    expect(ingestRes.body.data.triggeredAlerts.length).toBeGreaterThan(0);
  });
});
