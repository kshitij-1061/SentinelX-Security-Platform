import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { seedDatabase } from "../src/db/seed";

describe("Deception & Honeypot Module (/api/v1/honeypots & /api/v1/honeypot-events)", () => {
  let analystToken: string;
  let honeypotId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();

    await request(app).post("/api/v1/auth/register").send({
      email: "deceptionanalyst@enterprise.lan",
      password: "AnalystPassword123!",
      fullName: "Deception Analyst",
      roleName: "SECURITY_ANALYST"
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "deceptionanalyst@enterprise.lan",
      password: "AnalystPassword123!"
    });
    analystToken = loginRes.body.data.access_token;
  });

  it("should list active honeypot traps", async () => {
    const res = await request(app)
      .get("/api/v1/honeypots")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    honeypotId = res.body.data[0].id;
  });

  it("should create a new honeypot trap simulation", async () => {
    const res = await request(app)
      .post("/api/v1/honeypots")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        name: "Test SSH Trap",
        type: "SSH",
        hostname: "trap-ssh-01.lab",
        ip: "10.0.99.10",
        port: 2222,
        description: "Controlled SSH deception trap"
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Test SSH Trap");
  });

  it("should simulate honeypot attack interaction safely", async () => {
    const res = await request(app)
      .post("/api/v1/honeypot-events")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        honeypotId,
        sourceIP: "198.51.100.44",
        eventType: "UNAUTHORIZED_SSH_ATTEMPT",
        username: "root",
        commandData: "cat /etc/shadow"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const eventsRes = await request(app)
      .get("/api/v1/honeypot-events")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(eventsRes.status).toBe(200);
    const event = eventsRes.body.data.find((e: any) => e.honeypotId === honeypotId);
    expect(event).toBeDefined();
    expect(event.commandData).toBe("cat /etc/shadow");
  });
});
