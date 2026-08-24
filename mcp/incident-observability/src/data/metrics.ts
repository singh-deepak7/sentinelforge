export interface ServiceMetric {
  timestamp: string;
  service: string;
  environment: string;
  requestCount: number;
  errorRatePercent: number;
  p95LatencyMs: number;
}

export const serviceMetrics: ServiceMetric[] = [
  {
    timestamp: "2026-08-24T14:00:00Z",
    service: "checkout-service",
    environment: "production",
    requestCount: 12450,
    errorRatePercent: 0.7,
    p95LatencyMs: 420
  },
  {
    timestamp: "2026-08-24T14:10:00Z",
    service: "checkout-service",
    environment: "production",
    requestCount: 12820,
    errorRatePercent: 0.8,
    p95LatencyMs: 435
  },
  {
    timestamp: "2026-08-24T14:20:00Z",
    service: "checkout-service",
    environment: "production",
    requestCount: 13010,
    errorRatePercent: 0.9,
    p95LatencyMs: 448
  },
  {
    timestamp: "2026-08-24T14:25:00Z",
    service: "checkout-service",
    environment: "production",
    requestCount: 12680,
    errorRatePercent: 8.3,
    p95LatencyMs: 1180
  },
  {
    timestamp: "2026-08-24T14:30:00Z",
    service: "checkout-service",
    environment: "production",
    requestCount: 12110,
    errorRatePercent: 11.1,
    p95LatencyMs: 1640
  },
  {
    timestamp: "2026-08-24T14:40:00Z",
    service: "checkout-service",
    environment: "production",
    requestCount: 11940,
    errorRatePercent: 10.7,
    p95LatencyMs: 1585
  }
];