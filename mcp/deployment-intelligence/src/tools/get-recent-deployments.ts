import { deployments } from "../data/deployments.js";

export interface GetRecentDeploymentsInput {
  service: string;
  environment: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}

export function getRecentDeployments({
  service,
  environment,
  startTime,
  endTime,
  limit = 10
}: GetRecentDeploymentsInput) {
  return deployments
    .filter((deployment) => {
      if (deployment.service !== service) {
        return false;
      }

      if (deployment.environment !== environment) {
        return false;
      }

      const completedAt = new Date(deployment.completedAt).getTime();

      if (
        startTime &&
        completedAt < new Date(startTime).getTime()
      ) {
        return false;
      }

      if (
        endTime &&
        completedAt > new Date(endTime).getTime()
      ) {
        return false;
      }

      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() -
        new Date(a.completedAt).getTime()
    )
    .slice(0, limit);
}