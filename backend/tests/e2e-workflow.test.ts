import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { seedDatabase } from "../src/db/seed";

jest.setTimeout(30000);

describe("Complete Enterprise SOC End-to-End Workflow Integration Test", () => {
  let adminToken: string;
  let analystToken: string;
  let targetAssetId: string;
  let testVulnId: string;
  let ingestedEventId: string;
  let generatedAlertId: string;
  let correlationGroupId: string;
  let createdIncidentId: string;

  beforeAll(async () => {
    // Reset Database
    await prisma.incidentAction.deleteMany();
    await prisma.incidentNote.deleteMany();
    await prisma.incidentEvidence.deleteMany();
    await prisma.incidentAsset.deleteMany();
    await prisma.incidentAlert.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.riskAssessment.deleteMany();
    await prisma.attackPathEdge.deleteMany();
    await prisma.attackPathNode.deleteMany();
    await prisma.attackPath.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.securityEvent.deleteMany();
    await prisma.honeypotEvent.deleteMany();
    await prisma.honeypotSession.deleteMany();
    await prisma.honeypot.deleteMany();
    await prisma.correlationGroup.deleteMany();
    await prisma.threatIndicator.deleteMany();
    await prisma.remediationTask.deleteMany();
    await prisma.assetVulnerability.deleteMany();
    await prisma.vulnerability.deleteMany();
    await prisma.assetSoftware.deleteMany();
    await prisma.assetService.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();

    await seedDatabase();

    // 1. Register & Login Admin
    await request(app).post("/api/v1/auth/register").send({
      email: "socadmin@enterprise.lan",
      password: "AdminPassword123!",
      fullName: "SOC Master Administrator",
      roleName: "ADMIN"
    });
    const adminLogin = await request(app).post("/api/v1/auth/login").send({
      email: "socadmin@enterprise.lan",
      password: "AdminPassword123!"
    });
    adminToken = adminLogin.body.data.access_token;

    // Register & Login Analyst
    await request(app).post("/api/v1/auth/register").send({
      email: "socanalyst@enterprise.lan",
      password: "AnalystPassword123!",
      fullName: "SOC Lead Analyst",
      roleName: "SECURITY_ANALYST"
    });
    const analystLogin = await request(app).post("/api/v1/auth/login").send({
      email: "socanalyst@enterprise.lan",
      password: "AnalystPassword123!"
    });
    analystToken = analystLogin.body.data.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Step 1 & 2: Dashboard metrics summary endpoint returns valid counts", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/summary")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assets).toBeDefined();
  });

  it("Step 3: Create and view enterprise target asset", async () => {
    const res = await request(app)
      .post("/api/v1/assets")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        hostname: "web-gateway-prod-01",
        ipAddress: "192.168.1.100",
        assetType: "SERVER",
        environment: "PRODUCTION",
        criticality: "CRITICAL"
      });

    expect(res.status).toBe(201);
    expect(res.body.data.hostname).toBe("web-gateway-prod-01");
    targetAssetId = res.body.data.id;
  });

  it("Step 4: Create vulnerability & link to target asset", async () => {
    const vulnRes = await request(app)
      .post("/api/v1/vulnerabilities")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        cve: "CVE-2024-9999",
        title: "Critical Web Gateway Remote Code Execution",
        description: "Buffer overflow flaw in HTTP request processing header",
        severity: "CRITICAL",
        cvssScore: 9.8,
        affectedSoftware: "Nginx",
        affectedVersion: "1.18.0",
        remediation: "Upgrade Nginx to version 1.20.1"
      });

    expect(vulnRes.status).toBe(201);
    testVulnId = vulnRes.body.data.id;

    const linkRes = await request(app)
      .post(`/api/v1/assets/${targetAssetId}/vulnerabilities`)
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        vulnerabilityId: testVulnId,
        detectedVersion: "1.18.0",
        exposure: "EXTERNAL_FACING"
      });

    expect(linkRes.status).toBe(201);
    expect(linkRes.body.data.riskDetails.riskScore).toBeGreaterThan(50);
  });

  it("Step 5 & 6: Ingest security event & trigger detection alert", async () => {
    const res = await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        source: "SURICATA",
        eventType: "AUTHENTICATION",
        sourceIP: "192.168.1.100",
        destinationIP: "192.168.1.1",
        severity: "CRITICAL",
        rawPayload: {
          event_type: "alert",
          src_ip: "192.168.1.100",
          dest_ip: "192.168.1.1",
          alert: {
            signature: "SSH Brute Force Authentication Attempt",
            severity: 1,
            category: "Attempted Administrator Privilege Gain"
          }
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.data.event.id).toBeDefined();
    expect(res.body.data.triggeredAlerts.length).toBeGreaterThan(0);

    ingestedEventId = res.body.data.event.id;
    generatedAlertId = res.body.data.triggeredAlerts[0].id;
  });

  it("Step 7 & 8: Alert appears in alerts queue & forms correlation group", async () => {
    // Ingest a second event for same asset to trigger asset-level correlation
    await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        source: "GENERIC_JSON",
        eventType: "PROCESS_CREATION",
        sourceIP: "192.168.1.100",
        severity: "HIGH",
        rawPayload: {
          command: "powershell -enc aW1wb3J0",
          process: "powershell.exe"
        }
      });

    const runCorrRes = await request(app)
      .post("/api/v1/correlations/run")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(runCorrRes.status).toBe(200);
    expect(runCorrRes.body.data.length).toBeGreaterThan(0);
    correlationGroupId = runCorrRes.body.data[0].id;
  });

  it("Step 9 & 10: Threat Intelligence IOC lookup & MITRE technique verification", async () => {
    const iocRes = await request(app)
      .get("/api/v1/threat-intelligence/enrich?ioc=198.51.100.45")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(iocRes.status).toBe(200);
    expect(iocRes.body.data.matched).toBe(true);

    const mitreRes = await request(app)
      .get("/api/v1/techniques/T1110.001")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(mitreRes.status).toBe(200);
    expect(mitreRes.body.data.techniqueId).toBe("T1110.001");
  });

  it("Step 11: Graph Analyzer computes potential attack path topology", async () => {
    const res = await request(app)
      .post("/api/v1/attack-paths/analyze")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].riskScore).toBeGreaterThan(0);
  });

  it("Step 12, 13, 14: Create Incident, View Timeline, Add Evidence & Analyst Note", async () => {
    const incRes = await request(app)
      .post("/api/v1/incidents")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        title: "Critical Compromise Investigation: Web Gateway 01",
        description: "Brute force and encoded execution observed on web gateway server.",
        severity: "CRITICAL",
        status: "INVESTIGATING",
        assignedAnalyst: "socanalyst@enterprise.lan",
        alertIds: [generatedAlertId],
        assetIds: [targetAssetId],
        correlationGroupId
      });

    expect(incRes.status).toBe(201);
    createdIncidentId = incRes.body.data.id;

    // Add Evidence
    const evRes = await request(app)
      .post(`/api/v1/incidents/${createdIncidentId}/evidence`)
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        type: "LOG_EXTRACT",
        description: "Suricata EVE JSON log payload excerpt",
        source: "Suricata Sensor Alpha",
        reference: ingestedEventId
      });

    expect(evRes.status).toBe(201);

    // Add Note
    const noteRes = await request(app)
      .post(`/api/v1/incidents/${createdIncidentId}/notes`)
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        content: "Hypothesis: External attacker used credential guessing followed by memory buffer attempt."
      });

    expect(noteRes.status).toBe(201);

    // Fetch Timeline
    const timelineRes = await request(app)
      .get(`/api/v1/incidents/${createdIncidentId}/timeline`)
      .set("Authorization", `Bearer ${analystToken}`);

    expect(timelineRes.status).toBe(200);
    expect(timelineRes.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it("Step 15, 16, 17: Execute SAFE RESPONSE SIMULATION & Resolve Incident", async () => {
    const respRes = await request(app)
      .post(`/api/v1/incidents/${createdIncidentId}/actions`)
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        action: "BLOCK_TEST_IP",
        target: "198.51.100.45",
        reason: "Block suspicious external attacker IP in simulated firewall rules.",
        confirmed: true
      });

    expect(respRes.status).toBe(200);
    expect(respRes.body.data.simulationResult.mode).toBe("SAFE_SIMULATION");

    // Close Incident via Response Action CLOSE_INCIDENT
    const closeRes = await request(app)
      .post(`/api/v1/incidents/${createdIncidentId}/actions`)
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        action: "CLOSE_INCIDENT",
        target: createdIncidentId,
        reason: "Incident investigation and response simulation verified.",
        confirmed: true
      });

    expect(closeRes.status).toBe(200);

    const checkInc = await request(app)
      .get(`/api/v1/incidents/${createdIncidentId}`)
      .set("Authorization", `Bearer ${analystToken}`);

    expect(checkInc.body.data.status).toBe("RESOLVED");
  });
});
