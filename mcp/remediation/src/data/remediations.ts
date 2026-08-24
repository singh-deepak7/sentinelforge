export interface RemediationPlan {
  id: string;
  incidentId: string;
  service: string;
  environment: string;
  action: string;
  configurationKey: string;
  currentValue: number;
  proposedValue: number;
  reason: string;
  risk: "low" | "medium" | "high";
  reversible: boolean;
  requiresApproval: boolean;
}

export const remediationPlans: RemediationPlan[] = [
  {
    id: "REM-2026-001",
    incidentId: "INC-2026-001",
    service: "checkout-service",
    environment: "production",

    action: "restore_configuration",

    configurationKey: "payment.authorization.timeoutMs",
    currentValue: 500,
    proposedValue: 3000,

    reason:
      "Restore the payment authorization timeout to the previously known value after controlled validation showed authorization succeeds with the previous timeout.",

    risk: "medium",
    reversible: true,

    requiresApproval: true,
  },
];