import { describe, expect, it } from "vitest";

import { getDeploymentDetails } from "../src/tools/get-deployment-details.js";

describe("getDeploymentDetails", () => {
  it("returns details for an existing deployment", () => {
    const result = getDeploymentDetails("DEP-2026-081");

    expect(result).not.toBeNull();
    expect(result?.deploymentId).toBe("DEP-2026-081");
    expect(result?.version).toBe("2.4.1");
    expect(result?.previousVersion).toBe("2.4.0");
    expect(result?.changeType).toBe("mixed");
  });

  it("returns the changed components", () => {
    const result = getDeploymentDetails("DEP-2026-081");

    expect(result?.changedComponents).toContain(
      "payment-authorization-client"
    );

    expect(result?.changedComponents).toContain(
      "payment-configuration"
    );
  });

  it("returns the changed files", () => {
    const result = getDeploymentDetails("DEP-2026-081");

    expect(result?.changedFiles).toContain(
      "config/production/payment.yaml"
    );
  });

  it("returns null for an unknown deployment", () => {
    const result = getDeploymentDetails("DEP-UNKNOWN");

    expect(result).toBeNull();
  });
});