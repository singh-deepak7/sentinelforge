import { remediationPlans } from "../data/remediations.js";

export function proposeRemediation(incidentId: string) {
  return (
    remediationPlans.find(
      (plan) => plan.incidentId === incidentId
    ) ?? null
  );
}