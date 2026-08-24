export type LogLevel = "INFO" | "WARN" | "ERROR";

export interface ServiceLog {
  timestamp: string;
  service: string;
  environment: string;
  level: LogLevel;
  traceId: string;
  message: string;
}

export const serviceLogs: ServiceLog[] = [
  {
    timestamp: "2026-08-24T14:20:12Z",
    service: "checkout-service",
    environment: "production",
    level: "INFO",
    traceId: "trace-8f91",
    message: "Checkout completed successfully"
  },
  {
    timestamp: "2026-08-24T14:23:48Z",
    service: "checkout-service",
    environment: "production",
    level: "INFO",
    traceId: "trace-a112",
    message: "Payment authorization completed successfully"
  },
  {
    timestamp: "2026-08-24T14:24:37Z",
    service: "checkout-service",
    environment: "production",
    level: "WARN",
    traceId: "trace-b721",
    message: "Payment authorization response exceeded expected latency"
  },
  {
    timestamp: "2026-08-24T14:25:04Z",
    service: "checkout-service",
    environment: "production",
    level: "ERROR",
    traceId: "trace-c301",
    message:
      "PaymentTimeoutException: payment-service authorization request timed out"
  },
  {
    timestamp: "2026-08-24T14:25:19Z",
    service: "checkout-service",
    environment: "production",
    level: "ERROR",
    traceId: "trace-c417",
    message:
      "Checkout failed because payment authorization did not complete within the configured timeout"
  },
  {
    timestamp: "2026-08-24T14:27:43Z",
    service: "checkout-service",
    environment: "production",
    level: "ERROR",
    traceId: "trace-d201",
    message:
      "PaymentTimeoutException: payment-service authorization request timed out"
  },
  {
    timestamp: "2026-08-24T14:31:08Z",
    service: "checkout-service",
    environment: "production",
    level: "ERROR",
    traceId: "trace-e114",
    message:
      "PaymentTimeoutException: payment-service authorization request timed out"
  }
];