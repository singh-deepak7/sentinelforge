export interface Deployment {
  id: string;
  service: string;
  environment: string;
  version: string;
  previousVersion: string;
  status: "succeeded" | "failed" | "rolled_back";
  startedAt: string;
  completedAt: string;
  deployedBy: string;
  commitSha: string;
  summary: string;
}

export const deployments: Deployment[] = [
  {
    id: "DEP-2026-081",
    service: "checkout-service",
    environment: "production",
    version: "2.4.1",
    previousVersion: "2.4.0",
    status: "succeeded",
    startedAt: "2026-08-24T14:18:00Z",
    completedAt: "2026-08-24T14:22:00Z",
    deployedBy: "checkout-platform",
    commitSha: "4c21d8a",
    summary:
      "Checkout service release containing payment integration and configuration updates."
  },
  {
    id: "DEP-2026-076",
    service: "checkout-service",
    environment: "production",
    version: "2.4.0",
    previousVersion: "2.3.9",
    status: "succeeded",
    startedAt: "2026-08-21T16:02:00Z",
    completedAt: "2026-08-21T16:06:00Z",
    deployedBy: "checkout-platform",
    commitSha: "3fa81bc",
    summary:
      "Checkout service maintenance release."
  },
  {
    id: "DEP-2026-080",
    service: "inventory-service",
    environment: "production",
    version: "5.8.2",
    previousVersion: "5.8.1",
    status: "succeeded",
    startedAt: "2026-08-24T13:40:00Z",
    completedAt: "2026-08-24T13:44:00Z",
    deployedBy: "inventory-platform",
    commitSha: "91ab203",
    summary:
      "Inventory caching improvements."
  }
];

export interface DeploymentDetails {
  deploymentId: string;
  service: string;
  environment: string;
  version: string;
  previousVersion: string;
  commitSha: string;
  changeType: "application" | "configuration" | "mixed";
  changedComponents: string[];
  changedFiles: string[];
  releaseNotes: string[];
}

export const deploymentDetails: DeploymentDetails[] = [
  {
    deploymentId: "DEP-2026-081",
    service: "checkout-service",
    environment: "production",
    version: "2.4.1",
    previousVersion: "2.4.0",
    commitSha: "4c21d8a",
    changeType: "mixed",
    changedComponents: [
      "payment-authorization-client",
      "payment-configuration"
    ],
    changedFiles: [
      "src/payment/payment-client.ts",
      "config/production/payment.yaml"
    ],
    releaseNotes: [
      "Updated payment authorization integration.",
      "Adjusted production payment client configuration."
    ]
  },
  {
    deploymentId: "DEP-2026-076",
    service: "checkout-service",
    environment: "production",
    version: "2.4.0",
    previousVersion: "2.3.9",
    commitSha: "3fa81bc",
    changeType: "application",
    changedComponents: [
      "checkout-validation"
    ],
    changedFiles: [
      "src/checkout/validation.ts"
    ],
    releaseNotes: [
      "Checkout validation maintenance changes."
    ]
  }
];