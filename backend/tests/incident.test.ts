import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { seedDatabase } from "../src/db/seed";

describe("Incident Investigation & Controlled Response Module (/api/v1/incidents)", () => {
  let analystToken: string;
  let incidentId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();

    await request(app).post("/api/v1/auth/register").send({
      email: "incidentanalyst@enterprise.lan",
      password: "AnalystPassword123!",
      fullName: "Incident Analyst",
      roleName: "SECURITY_ANALYST"
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "incidentanalyst@enterprise.lan",
      password: "AnalystPassword123!"
    });
    analystToken = loginRes.body.data.access_token;
  });

  it("should create a new security incident", async () => {
    const res = await request(app)
      .post("/api/v1/incidents")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        title: "Unauthorized SSH Access Investigation",
        description: "Multiple bruteforce alerts detected targeting production database cluster.",
        severity: "HIGH",
        status: "NEW"
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Unauthorized SSH Access Investigation");
    incidentId = res.body.data.id;
  });

  it("should retrieve incident investigation timeline & details", async () => {
    const res = await request(app)
      .get(`/api/v1/incidents/${incidentId}`)
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(incidentId);
    expect(Array.isArray(res.body.data.notes)).toBe(true);
    expect(Array.isArray(res.body.data.evidence)).toBe(true);
  });

  it("should add analyst investigation note and evidence artifact", async () => {
    const noteRes = await request(app)
      .post(`/api/v1/incidents/${incidentId}/notes`)
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        content: "Initial triage completed. Source IP 198.51.100.45 confirmed malicious."
      });

    expect(noteRes.status).toBe(201);

    const evidenceRes = await request(app)
      .post(`/api/v1/incidents/${incidentId}/evidence`)
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        type: "LOG_EXTRACT",
        description: "Auth log excerpt with failed password attempts",
        source: "Syslog-10.0.0.50",
        reference: "log-id-99120"
      });

    expect(evidenceRes.status).toBe(201);
  });

  it("should execute controlled safe simulation response action requiring explicit confirmation", async () => {
    const actionRes = await request(app)
      .post(`/api/v1/incidents/${incidentId}/actions`)
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        action: "ISOLATE_TEST_ENDPOINT",
        target: "db-cluster-01",
        reason: "Contain potential lateral movement",
        confirmed: true
      });

    expect(actionRes.status).toBe(200);
    expect(actionRes.body.data.simulationResult.mode).toBe("SAFE_SIMULATION");
    expect(actionRes.body.data.simulationResult.auditDetails).toContain("SAFE_SIMULATION");
  });

  it("should update incident status to RESOLVED", async () => {
    const res = await request(app)
      .patch(`/api/v1/incidents/${incidentId}`)
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        status: "RESOLVED",
        resolution: "Threat actor IP blocked at perimeter firewall. Host isolated and audited."
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("RESOLVED");
  });
});
