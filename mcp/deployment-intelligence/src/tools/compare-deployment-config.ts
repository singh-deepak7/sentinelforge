export interface ConfigChange {
  key: string;
  previousValue: string;
  currentValue: string;
  changeType: "added" | "removed" | "modified";
}

export interface DeploymentConfigComparison {
  deploymentId: string;
  service: string;
  environment: string;
  previousVersion: string;
  currentVersion: string;
  changes: ConfigChange[];
}

const configComparisons: DeploymentConfigComparison[] = [
  {
    deploymentId: "DEP-2026-081",
    service: "checkout-service",
    environment: "production",
    previousVersion: "2.4.0",
    currentVersion: "2.4.1",
    changes: [
      {
        key: "payment.authorization.timeoutMs",
        previousValue: "3000",
        currentValue: "500",
        changeType: "modified",
      },
    ],
  },
];

export function compareDeploymentConfig(
  deploymentId: string,
): DeploymentConfigComparison | null {
  return (
    configComparisons.find(
      (comparison) => comparison.deploymentId === deploymentId,
    ) ?? null
  );
}
