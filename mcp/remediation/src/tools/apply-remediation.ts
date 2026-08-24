import { productionConfiguration } from "../data/production-state.js";
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

export function applyRemediation(
  remediationId: string
): ApplyRemediationResult | null {
  const plan = remediationPlans.find(
    (item) => item.id === remediationId
  );

  if (!plan) {
    return null;
  }

  const previousValue =
    productionConfiguration.values[plan.configurationKey];

  productionConfiguration.values[plan.configurationKey] =
    plan.proposedValue;

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