import { deploymentDetails } from "../data/deployments.js";

export function getDeploymentDetails(deploymentId: string) {
  return (
    deploymentDetails.find(
      (deployment) => deployment.deploymentId === deploymentId
    ) ?? null
  );
}