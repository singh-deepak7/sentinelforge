import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  getProductionState,
  getProductionSimulatorUrl,
  resetProductionState,
  updateProductionState
} from "../src/index.js";

const sampleState = {
  service: "checkout-service",
  environment: "production",
  paymentAuthorizationTimeoutMs: 500,
  remediationApplied: false,
  activeRemediationId: null,
  updatedAt: "2026-08-24T20:00:00.000Z"
};

describe("production-state client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads production state from the simulator", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify(sampleState),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    );

    const state = await getProductionState();

    expect(
      state.paymentAuthorizationTimeoutMs
    ).toBe(500);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3010/state",
      undefined
    );
  });

  it("updates production state through the simulator", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ...sampleState,
          paymentAuthorizationTimeoutMs: 3000,
          remediationApplied: true,
          activeRemediationId: "REM-2026-001"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    );

    const state = await updateProductionState({
      paymentAuthorizationTimeoutMs: 3000,
      remediationApplied: true,
      activeRemediationId: "REM-2026-001"
    });

    expect(
      state.paymentAuthorizationTimeoutMs
    ).toBe(3000);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3010/state",
      expect.objectContaining({
        method: "PATCH"
      })
    );
  });

  it("resets production state through the simulator", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify(sampleState),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    );

    const state = await resetProductionState();

    expect(
      state.paymentAuthorizationTimeoutMs
    ).toBe(500);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3010/reset",
      expect.objectContaining({
        method: "POST"
      })
    );
  });

  it("exposes the configured simulator URL", () => {
    expect(
      getProductionSimulatorUrl()
    ).toBe("http://localhost:3010");
  });
});