export interface ProductionConfiguration {
  service: string;
  environment: string;
  values: Record<string, number>;
}

export const productionConfiguration: ProductionConfiguration = {
  service: "checkout-service",
  environment: "production",
  values: {
    "payment.authorization.timeoutMs": 500
  }
};