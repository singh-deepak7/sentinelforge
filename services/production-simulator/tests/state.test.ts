import {
  beforeEach,
  describe,
  expect,
  it
} from "vitest";

import {
  getProductionState,
  resetProductionState,
  updateProductionState
} from "../src/state.js";

describe("production simulator state", () => {
  beforeEach(() => {
    resetProductionState();
  });

  it("starts in the degraded state", () => {
    const state = getProductionState();

    expect(state.service).toBe(
      "checkout-service"
    );

    expect(state.environment).toBe(
      "production"
    );

    expect(
      state.paymentAuthorizationTimeoutMs
    ).toBe(500);

    expect(
      state.remediationApplied
    ).toBe(false);

    expect(
      state.activeRemediationId
    ).toBeNull();
  });

  it("updates the timeout configuration", () => {
    updateProductionState({
      paymentAuthorizationTimeoutMs: 3000
    });

    const state = getProductionState();

    expect(
      state.paymentAuthorizationTimeoutMs
    ).toBe(3000);
  });

  it("records remediation state", () => {
    updateProductionState({
      paymentAuthorizationTimeoutMs: 3000,
      remediationApplied: true,
      activeRemediationId: "REM-2026-001"
    });

    const state = getProductionState();

    expect(
      state.remediationApplied
    ).toBe(true);

    expect(
      state.activeRemediationId
    ).toBe("REM-2026-001");
  });

  it("resets the environment", () => {
    updateProductionState({
      paymentAuthorizationTimeoutMs: 3000,
      remediationApplied: true,
      activeRemediationId: "REM-2026-001"
    });

    const state = resetProductionState();

    expect(
      state.paymentAuthorizationTimeoutMs
    ).toBe(500);

    expect(
      state.remediationApplied
    ).toBe(false);

    expect(
      state.activeRemediationId
    ).toBeNull();
  });
});