import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "./app";

// Mock DB connection check
vi.mock("./core/database/connection", () => ({
  dbPool: {
    query: vi.fn(),
    getConnection: vi.fn(),
    end: vi.fn(),
  },
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
}));

describe("Express App Integration", () => {
  const app = createApp();

  it("should return root metadata and doc links on GET /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.documentation).toBe("/api/docs");
    expect(res.body.endpoints).toBeDefined();
  });

  it("should return 200 on GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("UP");
  });

  it("should return 200 on GET /health/ready when database is connected", async () => {
    const res = await request(app).get("/health/ready");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("READY");
    expect(res.body.database).toBe("CONNECTED");
  });

  it("should serve OpenAPI specification at /api/docs/openapi.json", async () => {
    const res = await request(app).get("/api/docs/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.info.title).toContain("BTS.id");
  });

  it("should return 404 for unknown route", async () => {
    const res = await request(app).get("/api/unknown-route");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("not found");
  });
});
