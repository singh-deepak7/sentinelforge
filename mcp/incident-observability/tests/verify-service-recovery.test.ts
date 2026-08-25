import {
  resetProductionState,
  updateProductionState
} from "@sentinelforge/production-state";

import {
  beforeEach,
  describe,
  expect,
  it
} from "vitest";

import {
  verifyServiceRecovery
} from "../src/tools/verify-service-recovery.js";

describe("verifyServiceRecovery", () => {
  beforeEach(() => {
    resetProductionState();
  });

  it("reports degraded state before remediation", () => {
    const result = verifyServiceRecovery();

    expect(result.recovered).toBe(false);
    expect(result.timeoutMs).toBe(500);
    expect(result.errorRatePercent).toBeGreaterThan(5);
    expect(result.paymentTimeoutCount).toBeGreaterThan(0);
  });

  it("reports recovery after remediation", () => {
    updateProductionState({
      paymentAuthorizationTimeoutMs: 3000,
      remediationApplied: true,
      activeRemediationId: "REM-2026-001"
    });

    const result = verifyServiceRecovery();

    expect(result.recovered).toBe(true);
    expect(result.timeoutMs).toBe(3000);
    expect(result.errorRatePercent).toBeLessThan(1);
    expect(result.paymentTimeoutCount).toBe(0);
  });
});