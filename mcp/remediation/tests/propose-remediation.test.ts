import { describe, expect, it } from "vitest";

import { proposeRemediation } from "../src/tools/propose-remediation.js";

describe("proposeRemediation", () => {
  it("returns a remediation plan for a known incident", () => {
    const result = proposeRemediation("INC-2026-001");

    expect(result).not.toBeNull();
    expect(result?.id).toBe("REM-2026-001");
    expect(result?.service).toBe("checkout-service");
    expect(result?.environment).toBe("production");
  });

  it("restores the payment timeout from 500 to 3000", () => {
    const result = proposeRemediation("INC-2026-001");

    expect(result?.configurationKey).toBe(
      "payment.authorization.timeoutMs"
    );
    expect(result?.currentValue).toBe(500);
    expect(result?.proposedValue).toBe(3000);
  });

  it("marks the remediation as requiring approval", () => {
    const result = proposeRemediation("INC-2026-001");

    expect(result?.requiresApproval).toBe(true);
    expect(result?.risk).toBe("medium");
    expect(result?.reversible).toBe(true);
  });

  it("returns null for an unknown incident", () => {
    const result = proposeRemediation("INC-UNKNOWN");

    expect(result).toBeNull();
  });
});