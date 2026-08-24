import { paymentScenarios } from "../data/payment-scenarios.js";

export interface RunTimeoutValidationInput {
  scenarioId: string;
  timeoutMs: number;
}

export interface TimeoutValidationResult {
  scenarioId: string;
  timeoutMs: number;
  simulatedPaymentLatencyMs: number;
  outcome: "PASS" | "FAIL";
  timedOut: boolean;
  observedDurationMs: number;
  reason: string;
}

export function runTimeoutValidation({
  scenarioId,
  timeoutMs
}: RunTimeoutValidationInput): TimeoutValidationResult | null {
  const scenario = paymentScenarios.find(
    (item) => item.scenarioId === scenarioId
  );

  if (!scenario) {
    return null;
  }

  const timedOut = scenario.simulatedPaymentLatencyMs > timeoutMs;

  return {
    scenarioId,
    timeoutMs,
    simulatedPaymentLatencyMs: scenario.simulatedPaymentLatencyMs,
    outcome: timedOut ? "FAIL" : "PASS",
    timedOut,
    observedDurationMs: timedOut
      ? timeoutMs
      : scenario.simulatedPaymentLatencyMs,
    reason: timedOut
      ? "Payment authorization exceeded the configured client timeout."
      : "Payment authorization completed within the configured client timeout."
  };
}