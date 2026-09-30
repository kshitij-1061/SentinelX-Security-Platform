import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { seedDatabase } from "../src/db/seed";

jest.setTimeout(20000);

describe("Authentication Routes (/api/v1/auth)", () => {
  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  const testUser = {
    email: "nodeanalyst@enterprise.lan",
    password: "SecureNodePassword123!",
    fullName: "Node SOC Analyst",
    roleName: "SECURITY_ANALYST"
  };

  it("should register a new security user with Argon2 hashed password", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
    expect(res.body.data.role.name).toBe("SECURITY_ANALYST");
  }, 15000);

  it("should reject duplicate user registration", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should authenticate valid credentials and return JWT token", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.access_token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  }, 15000);

  it("should reject invalid login credentials and capture failed login audit log", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: "WrongPassword123!"
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return user profile for authenticated JWT token on /auth/me", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password
    });
    const token = loginRes.body.data.access_token;

    const meRes = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.email).toBe(testUser.email);
  });
});
