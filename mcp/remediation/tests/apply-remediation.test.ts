import {
  resetProductionState,
  getProductionState
} from "@sentinelforge/production-state";

import {
  beforeEach,
  describe,
  expect,
  it
} from "vitest";

import { applyRemediation } from "../src/tools/apply-remediation.js";

describe("applyRemediation", () => {
  beforeEach(() => {
    resetProductionState();
  });

  it("applies the proposed configuration value", () => {
    const result = applyRemediation("REM-2026-001");

    expect(result).not.toBeNull();
    expect(result?.previousValue).toBe(500);
    expect(result?.appliedValue).toBe(3000);

    const state = getProductionState();

    expect(
      state.paymentAuthorizationTimeoutMs
    ).toBe(3000);
  });

  it("records remediation state", () => {
    applyRemediation("REM-2026-001");

    const state = getProductionState();

    expect(state.remediationApplied).toBe(true);
    expect(state.activeRemediationId).toBe(
      "REM-2026-001"
    );
  });

  it("returns execution metadata", () => {
    const result = applyRemediation("REM-2026-001");

    expect(result?.status).toBe("applied");
    expect(result?.incidentId).toBe("INC-2026-001");
    expect(result?.service).toBe("checkout-service");
    expect(result?.environment).toBe("production");
  });

  it("returns null for an unknown remediation", () => {
    const result = applyRemediation("REM-UNKNOWN");

    expect(result).toBeNull();
  });
});