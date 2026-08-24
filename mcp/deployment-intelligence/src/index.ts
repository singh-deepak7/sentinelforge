import express from "express";
import { randomUUID } from "node:crypto";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { getRecentDeployments } from "./tools/get-recent-deployments.js";
import { getDeploymentDetails } from "./tools/get-deployment-details.js";
import { compareDeploymentConfig } from "./tools/compare-deployment-config.js";

const PORT = Number(process.env.PORT ?? 3002);

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "sentinelforge-deployment-intelligence",
    version: "0.1.0",
  });

  const deploymentSchema = z.object({
    id: z.string(),
    service: z.string(),
    environment: z.string(),
    version: z.string(),
    previousVersion: z.string(),
    status: z.enum(["succeeded", "failed", "rolled_back"]),
    startedAt: z.string(),
    completedAt: z.string(),
    deployedBy: z.string(),
    commitSha: z.string(),
    summary: z.string(),
  });

  server.registerTool(
    "get_recent_deployments",
    {
      description:
        "Retrieve recent deployments for a service and environment, optionally filtered by time range.",
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
        limit: z
          .number()
          .int()
          .positive()
          .max(50)
          .optional()
          .describe("Maximum number of deployments to return"),
      },
      outputSchema: {
        service: z.string(),
        environment: z.string(),
        count: z.number(),
        deployments: z.array(deploymentSchema),
      },
    },
    async ({ service, environment, startTime, endTime, limit }) => {
      const deployments = getRecentDeployments({
        service,
        environment,
        startTime,
        endTime,
        limit,
      });

      const result = {
        service,
        environment,
        count: deployments.length,
        deployments,
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
  const deploymentDetailsSchema = z.object({
    deploymentId: z.string(),
    service: z.string(),
    environment: z.string(),
    version: z.string(),
    previousVersion: z.string(),
    commitSha: z.string(),
    changeType: z.enum(["application", "configuration", "mixed"]),
    changedComponents: z.array(z.string()),
    changedFiles: z.array(z.string()),
    releaseNotes: z.array(z.string()),
  });
  server.registerTool(
    "get_deployment_details",
    {
      description:
        "Retrieve detailed change information for a specific deployment.",
      inputSchema: {
        deploymentId: z
          .string()
          .describe("Deployment identifier, for example DEP-2026-081"),
      },
      outputSchema: deploymentDetailsSchema,
    },
    async ({ deploymentId }) => {
      const deployment = getDeploymentDetails(deploymentId);

      if (!deployment) {
        return {
          content: [
            {
              type: "text",
              text: `Deployment ${deploymentId} was not found.`,
            },
          ],
          isError: true,
        };
      }

      const structuredContent: Record<string, unknown> = {
        ...deployment,
      };

      return {
        structuredContent,
        content: [
          {
            type: "text",
            text: JSON.stringify(deployment, null, 2),
          },
        ],
      };
    },
  );
  const configChangeSchema = z.object({
    key: z.string(),
    previousValue: z.string(),
    currentValue: z.string(),
    changeType: z.enum(["added", "removed", "modified"]),
  });

  const deploymentConfigComparisonSchema = z.object({
    deploymentId: z.string(),
    service: z.string(),
    environment: z.string(),
    previousVersion: z.string(),
    currentVersion: z.string(),
    changes: z.array(configChangeSchema),
  });
  server.registerTool(
    "compare_deployment_config",
    {
      description:
        "Compare production configuration between the previous and current versions for a specific deployment.",
      inputSchema: {
        deploymentId: z
          .string()
          .describe("Deployment identifier, for example DEP-2026-081"),
      },
      outputSchema: deploymentConfigComparisonSchema,
    },
    async ({ deploymentId }) => {
      const comparison = compareDeploymentConfig(deploymentId);

      if (!comparison) {
        return {
          content: [
            {
              type: "text",
              text: `No configuration comparison was found for deployment ${deploymentId}.`,
            },
          ],
          isError: true,
        };
      }

      const structuredContent: Record<string, unknown> = {
        ...comparison,
      };

      return {
        structuredContent,
        content: [
          {
            type: "text",
            text: JSON.stringify(comparison, null, 2),
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

  await transports.get(sessionId)!.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).json({
      error: "Missing or invalid MCP session",
    });

    return;
  }

  await transports.get(sessionId)!.handleRequest(req, res);
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "sentinelforge-deployment-intelligence",
  });
});

app.listen(PORT, () => {
  console.error(
    `SentinelForge Deployment Intelligence MCP server listening on port ${PORT}`,
  );
});
