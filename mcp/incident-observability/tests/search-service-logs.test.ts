import { describe, expect, it } from "vitest";

import { searchServiceLogs } from "../src/tools/search-service-logs.js";

describe("searchServiceLogs", () => {
  it("returns logs for the requested service and environment", () => {
    const logs = searchServiceLogs({
      service: "checkout-service",
      environment: "production"
    });

    expect(logs.length).toBeGreaterThan(0);

    for (const log of logs) {
      expect(log.service).toBe("checkout-service");
      expect(log.environment).toBe("production");
    }
  });

  it("filters logs by level", () => {
    const logs = searchServiceLogs({
      service: "checkout-service",
      environment: "production",
      level: "ERROR"
    });

    expect(logs.length).toBeGreaterThan(0);

    for (const log of logs) {
      expect(log.level).toBe("ERROR");
    }
  });

  it("filters logs using a case-insensitive query", () => {
    const logs = searchServiceLogs({
      service: "checkout-service",
      environment: "production",
      query: "paymenttimeoutexception"
    });

    expect(logs).toHaveLength(3);

    for (const log of logs) {
      expect(log.message.toLowerCase()).toContain(
        "paymenttimeoutexception"
      );
    }
  });

  it("filters logs by time range", () => {
    const logs = searchServiceLogs({
      service: "checkout-service",
      environment: "production",
      startTime: "2026-08-24T14:25:00Z",
      endTime: "2026-08-24T14:27:59Z"
    });

    expect(logs).toHaveLength(3);
  });

  it("returns an empty array when no logs match", () => {
    const logs = searchServiceLogs({
      service: "checkout-service",
      environment: "production",
      query: "database-connection-refused"
    });

    expect(logs).toEqual([]);
  });
});