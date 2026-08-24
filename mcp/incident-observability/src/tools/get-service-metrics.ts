import { serviceMetrics } from "../data/metrics.js";

export interface GetServiceMetricsInput {
  service: string;
  environment: string;
  startTime?: string;
  endTime?: string;
}

export function getServiceMetrics({
  service,
  environment,
  startTime,
  endTime
}: GetServiceMetricsInput) {
  return serviceMetrics.filter((metric) => {
    if (metric.service !== service) {
      return false;
    }

    if (metric.environment !== environment) {
      return false;
    }

    const timestamp = new Date(metric.timestamp).getTime();

    if (startTime && timestamp < new Date(startTime).getTime()) {
      return false;
    }

    if (endTime && timestamp > new Date(endTime).getTime()) {
      return false;
    }

    return true;
  });
}