import { describe, expect, it } from "vitest";

import { getRecentDeployments } from "../src/tools/get-recent-deployments.js";

describe("getRecentDeployments", () => {
  it("returns deployments for the requested service and environment", () => {
    const result = getRecentDeployments({
      service: "checkout-service",
      environment: "production"
    });

    expect(result).toHaveLength(2);

    for (const deployment of result) {
      expect(deployment.service).toBe("checkout-service");
      expect(deployment.environment).toBe("production");
    }
  });

  it("returns newest deployment first", () => {
    const result = getRecentDeployments({
      service: "checkout-service",
      environment: "production"
    });

    expect(result[0].id).toBe("DEP-2026-081");
    expect(result[0].version).toBe("2.4.1");
  });

  it("filters deployments by time range", () => {
    const result = getRecentDeployments({
      service: "checkout-service",
      environment: "production",
      startTime: "2026-08-24T14:00:00Z",
      endTime: "2026-08-24T15:00:00Z"
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("DEP-2026-081");
  });

  it("respects the result limit", () => {
    const result = getRecentDeployments({
      service: "checkout-service",
      environment: "production",
      limit: 1
    });

    expect(result).toHaveLength(1);
  });

  it("returns an empty array for an unknown service", () => {
    const result = getRecentDeployments({
      service: "unknown-service",
      environment: "production"
    });

    expect(result).toEqual([]);
  });
});