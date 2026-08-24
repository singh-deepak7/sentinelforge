import { describe, expect, it } from "vitest";

import { getServiceMetrics } from "../src/tools/get-service-metrics.js";

describe("getServiceMetrics", () => {
  it("returns metrics for the requested service and environment", () => {
    const metrics = getServiceMetrics({
      service: "checkout-service",
      environment: "production"
    });

    expect(metrics.length).toBeGreaterThan(0);

    for (const metric of metrics) {
      expect(metric.service).toBe("checkout-service");
      expect(metric.environment).toBe("production");
    }
  });

  it("filters metrics by time range", () => {
    const metrics = getServiceMetrics({
      service: "checkout-service",
      environment: "production",
      startTime: "2026-08-24T14:25:00Z",
      endTime: "2026-08-24T14:30:00Z"
    });

    expect(metrics).toHaveLength(2);
    expect(metrics[0].timestamp).toBe("2026-08-24T14:25:00Z");
    expect(metrics[1].timestamp).toBe("2026-08-24T14:30:00Z");
  });

  it("returns an empty array for an unknown service", () => {
    const metrics = getServiceMetrics({
      service: "unknown-service",
      environment: "production"
    });

    expect(metrics).toEqual([]);
  });
});