export interface Incident {
  id: string;
  title: string;
  service: string;
  environment: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  status: "open" | "investigating" | "resolved";
  startedAt: string;
  detectedAt: string;
  summary: string;
  symptoms: string[];
}

export const incidents: Incident[] = [
  {
    id: "INC-2026-001",
    title: "Checkout error rate increase",
    service: "checkout-service",
    environment: "production",
    severity: "SEV1",
    status: "investigating",
    startedAt: "2026-08-24T14:24:00Z",
    detectedAt: "2026-08-24T14:26:00Z",
    summary:
      "Checkout requests began failing at an elevated rate shortly after a production deployment.",
    symptoms: [
      "Checkout error rate increased above normal baseline",
      "Customers are intermittently unable to complete purchases",
      "Issue appears isolated to checkout-service"
    ]
  }
];