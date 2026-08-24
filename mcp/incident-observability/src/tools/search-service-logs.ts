import { serviceLogs, type LogLevel } from "../data/logs.js";

export interface SearchServiceLogsInput {
  service: string;
  environment: string;
  startTime?: string;
  endTime?: string;
  level?: LogLevel;
  query?: string;
}

export function searchServiceLogs({
  service,
  environment,
  startTime,
  endTime,
  level,
  query
}: SearchServiceLogsInput) {
  return serviceLogs.filter((log) => {
    if (log.service !== service) {
      return false;
    }

    if (log.environment !== environment) {
      return false;
    }

    const timestamp = new Date(log.timestamp).getTime();

    if (startTime && timestamp < new Date(startTime).getTime()) {
      return false;
    }

    if (endTime && timestamp > new Date(endTime).getTime()) {
      return false;
    }

    if (level && log.level !== level) {
      return false;
    }

    if (
      query &&
      !log.message.toLowerCase().includes(query.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
}