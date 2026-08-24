import { describe, expect, it } from "vitest";

import { compareDeploymentConfig } from "../src/tools/compare-deployment-config.js";

describe("compareDeploymentConfig", () => {
  it("returns configuration changes for a deployment", () => {
    const result = compareDeploymentConfig("DEP-2026-081");

    expect(result).not.toBeNull();
    expect(result?.deploymentId).toBe("DEP-2026-081");
    expect(result?.previousVersion).toBe("2.4.0");
    expect(result?.currentVersion).toBe("2.4.1");
  });

  it("identifies the payment authorization timeout change", () => {
    const result = compareDeploymentConfig("DEP-2026-081");

    const timeoutChange = result?.changes.find(
      (change) =>
        change.key === "payment.authorization.timeoutMs"
    );

    expect(timeoutChange).toBeDefined();
    expect(timeoutChange?.previousValue).toBe("3000");
    expect(timeoutChange?.currentValue).toBe("500");
    expect(timeoutChange?.changeType).toBe("modified");
  });

  it("returns only configuration values that changed", () => {
    const result = compareDeploymentConfig("DEP-2026-081");

    expect(result?.changes).toHaveLength(1);
  });

  it("returns null for an unknown deployment", () => {
    const result = compareDeploymentConfig("DEP-UNKNOWN");

    expect(result).toBeNull();
  });
});