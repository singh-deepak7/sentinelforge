import { describe, expect, it } from "vitest";

import { getIncident } from "../src/tools/get-incident.js";

describe("getIncident", () => {
  it("returns an incident when the ID exists", () => {
    const incident = getIncident("INC-2026-001");

    expect(incident).not.toBeNull();
    expect(incident?.id).toBe("INC-2026-001");
    expect(incident?.service).toBe("checkout-service");
    expect(incident?.environment).toBe("production");
    expect(incident?.severity).toBe("SEV1");
  });

  it("returns null when the incident does not exist", () => {
    const incident = getIncident("INC-DOES-NOT-EXIST");

    expect(incident).toBeNull();
  });
});