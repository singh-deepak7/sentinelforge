import express from "express";
import { randomUUID } from "node:crypto";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { getIncident } from "./tools/get-incident.js";
import { getServiceMetrics } from "./tools/get-service-metrics.js";
import { searchServiceLogs } from "./tools/search-service-logs.js";

const PORT = Number(process.env.PORT ?? 3001);

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "sentinelforge-incident-observability",
    version: "0.1.0",
  });

  const incidentOutputSchema = {
    id: z.string(),
    title: z.string(),
    service: z.string(),
    environment: z.string(),
    severity: z.enum(["SEV1", "SEV2", "SEV3"]),
    status: z.enum(["open", "investigating", "resolved"]),
    startedAt: z.string(),
    detectedAt: z.string(),
    summary: z.string(),
    symptoms: z.array(z.string()),
  };

  server.registerTool(
    "get_incident",
    {
      description:
        "Retrieve the current details of a production incident by incident ID.",
      inputSchema: {
        incidentId: z
          .string()
          .describe("Incident identifier, for example INC-2026-001"),
      },
      outputSchema: incidentOutputSchema,
    },
    async ({ incidentId }) => {
      const incident = getIncident(incidentId);

      if (!incident) {
        return {
          content: [
            {
              type: "text",
              text: `Incident ${incidentId} was not found.`,
            },
          ],
          isError: true,
        };
      }

      const structuredContent: Record<string, unknown> = {
        ...incident,
      };

      return {
        structuredContent,
        content: [
          {
            type: "text",
            text: JSON.stringify(incident, null, 2),
          },
        ],
      };
    },
  );
  const serviceMetricSchema = z.object({
    timestamp: z.string(),
    service: z.string(),
    environment: z.string(),
    requestCount: z.number(),
    errorRatePercent: z.number(),
    p95LatencyMs: z.number(),
  });

  server.registerTool(
    "get_service_metrics",
    {
      description:
        "Retrieve service error-rate and latency metrics for an environment and optional time range.",
      inputSchema: {
        service: z
          .string()
          .describe("Service name, for example checkout-service"),
        environment: z
          .string()
          .describe("Deployment environment, for example production"),
        startTime: z
          .string()
          .optional()
          .describe("Optional ISO-8601 start timestamp"),
        endTime: z
          .string()
          .optional()
          .describe("Optional ISO-8601 end timestamp"),
      },
      outputSchema: {
        service: z.string(),
        environment: z.string(),
        count: z.number(),
        metrics: z.array(serviceMetricSchema),
      },
    },
    async ({ service, environment, startTime, endTime }) => {
      const metrics = getServiceMetrics({
        service,
        environment,
        startTime,
        endTime,
      });

      const result = {
        service,
        environment,
        count: metrics.length,
        metrics,
      };

      const structuredContent: Record<string, unknown> = {
        ...result,
      };

      return {
        structuredContent,
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );
  const serviceLogSchema = z.object({
    timestamp: z.string(),
    service: z.string(),
    environment: z.string(),
    level: z.enum(["INFO", "WARN", "ERROR"]),
    traceId: z.string(),
    message: z.string(),
  });

  server.registerTool(
    "search_service_logs",
    {
      description:
        "Search application logs for a service by environment, time range, log level, and optional text query.",
      inputSchema: {
        service: z
          .string()
          .describe("Service name, for example checkout-service"),
        environment: z
          .string()
          .describe("Deployment environment, for example production"),
        startTime: z
          .string()
          .optional()
          .describe("Optional ISO-8601 start timestamp"),
        endTime: z
          .string()
          .optional()
          .describe("Optional ISO-8601 end timestamp"),
        level: z
          .enum(["INFO", "WARN", "ERROR"])
          .optional()
          .describe("Optional log level filter"),
        query: z
          .string()
          .optional()
          .describe("Optional case-insensitive text search"),
      },
      outputSchema: {
        service: z.string(),
        environment: z.string(),
        count: z.number(),
        logs: z.array(serviceLogSchema),
      },
    },
    async ({ service, environment, startTime, endTime, level, query }) => {
      const logs = searchServiceLogs({
        service,
        environment,
        startTime,
        endTime,
        level,
        query,
      });

      const result = {
        service,
        environment,
        count: logs.length,
        logs,
      };

      const structuredContent: Record<string, unknown> = {
        ...result,
      };

      return {
        structuredContent,
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  return server;
}

const app = express();

app.use(express.json());

const transports = new Map<string, StreamableHTTPServerTransport>();

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports.has(sessionId)) {
    transport = transports.get(sessionId)!;
  } else if (!sessionId && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (newSessionId) => {
        transports.set(newSessionId, transport);
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        transports.delete(transport.sessionId);
      }
    };

    const server = createMcpServer();

    await server.connect(transport);
  } else {
    res.status(400).json({
      error: "Invalid MCP request",
    });

    return;
  }

  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).json({
      error: "Missing or invalid MCP session",
    });

    return;
  }

  const transport = transports.get(sessionId)!;

  await transport.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).json({
      error: "Missing or invalid MCP session",
    });

    return;
  }

  const transport = transports.get(sessionId)!;

  await transport.handleRequest(req, res);
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "sentinelforge-incident-observability",
  });
});

app.listen(PORT, () => {
  console.error(
    `SentinelForge Incident Observability MCP server listening on port ${PORT}`,
  );
});
