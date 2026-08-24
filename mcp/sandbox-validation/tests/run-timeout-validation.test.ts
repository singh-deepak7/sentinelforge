import { describe, expect, it } from "vitest";

import { runTimeoutValidation } from "../src/tools/run-timeout-validation.js";

describe("runTimeoutValidation", () => {
  it("fails when the configured timeout is below payment latency", () => {
    const result = runTimeoutValidation({
      scenarioId: "PAYMENT-LATENCY-850",
      timeoutMs: 500
    });

    expect(result).not.toBeNull();
    expect(result?.outcome).toBe("FAIL");
    expect(result?.timedOut).toBe(true);
    expect(result?.simulatedPaymentLatencyMs).toBe(850);
    expect(result?.observedDurationMs).toBe(500);
  });

  it("passes when the configured timeout exceeds payment latency", () => {
    const result = runTimeoutValidation({
      scenarioId: "PAYMENT-LATENCY-850",
      timeoutMs: 3000
    });

    expect(result).not.toBeNull();
    expect(result?.outcome).toBe("PASS");
    expect(result?.timedOut).toBe(false);
    expect(result?.simulatedPaymentLatencyMs).toBe(850);
    expect(result?.observedDurationMs).toBe(850);
  });

  it("returns null for an unknown scenario", () => {
    const result = runTimeoutValidation({
      scenarioId: "UNKNOWN",
      timeoutMs: 500
    });

    expect(result).toBeNull();
  });
});