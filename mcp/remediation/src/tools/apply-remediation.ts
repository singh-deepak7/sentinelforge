import {
  getProductionState,
  updateProductionState
} from "@sentinelforge/production-state";

import { remediationPlans } from "../data/remediations.js";

export interface ApplyRemediationResult {
  remediationId: string;
  incidentId: string;
  service: string;
  environment: string;
  configurationKey: string;
  previousValue: number;
  appliedValue: number;
  status: "applied";
  message: string;
}

export async function applyRemediation(
  remediationId: string
): Promise<ApplyRemediationResult | null> {
  const plan = remediationPlans.find(
    (item) => item.id === remediationId
  );

  if (!plan) {
    return null;
  }

  const currentState =
    await getProductionState();

  const previousValue =
    currentState.paymentAuthorizationTimeoutMs;

  await updateProductionState({
    paymentAuthorizationTimeoutMs:
      plan.proposedValue,

    remediationApplied: true,

    activeRemediationId:
      plan.id
  });

  return {
    remediationId: plan.id,
    incidentId: plan.incidentId,
    service: plan.service,
    environment: plan.environment,
    configurationKey: plan.configurationKey,
    previousValue,
    appliedValue: plan.proposedValue,
    status: "applied",
    message:
      "The simulated production configuration change was applied successfully."
  };
}