export interface PaymentScenario {
  scenarioId: string;
  service: string;
  environment: string;
  simulatedPaymentLatencyMs: number;
}

export const paymentScenarios: PaymentScenario[] = [
  {
    scenarioId: "PAYMENT-LATENCY-850",
    service: "checkout-service",
    environment: "sandbox",
    simulatedPaymentLatencyMs: 850
  }
];