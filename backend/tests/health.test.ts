import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";

describe("GET /api/v1/health", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 200 OK with system status and database health", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("online");
    expect(res.body.data.database).toBe("healthy");
  });
});
