import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { seedDatabase } from "../src/db/seed";

describe("Authorization & RBAC Enforcement", () => {
  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("should enforce RBAC permission checking on protected endpoints", async () => {
    // 1. Register Admin user
    const adminUser = {
      email: "nodeadmin@enterprise.lan",
      password: "AdminPassword123!",
      fullName: "Node Admin",
      roleName: "ADMIN"
    };
    await request(app).post("/api/v1/auth/register").send(adminUser);
    const adminLogin = await request(app).post("/api/v1/auth/login").send({
      email: adminUser.email,
      password: adminUser.password
    });
    const adminToken = adminLogin.body.data.access_token;

    // Admin should access /users endpoint (USER_READ permission)
    const adminRes = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);

    // 2. Register Viewer user
    const viewerUser = {
      email: "nodeviewer@enterprise.lan",
      password: "ViewerPassword123!",
      fullName: "Node Viewer",
      roleName: "VIEWER"
    };
    await request(app).post("/api/v1/auth/register").send(viewerUser);
    const viewerLogin = await request(app).post("/api/v1/auth/login").send({
      email: viewerUser.email,
      password: viewerUser.password
    });
    const viewerToken = viewerLogin.body.data.access_token;

    // Viewer should be denied access (403 Forbidden)
    const viewerRes = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${viewerToken}`);
    expect(viewerRes.status).toBe(403);
    expect(viewerRes.body.success).toBe(false);
    expect(viewerRes.body.error.code).toBe("FORBIDDEN");
  });
});
