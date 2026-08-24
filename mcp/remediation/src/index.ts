import express from "express";
import { randomUUID } from "node:crypto";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { proposeRemediation } from "./tools/propose-remediation.js";
import { applyRemediation } from "./tools/apply-remediation.js";

const PORT = Number(process.env.PORT ?? 3004);

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "sentinelforge-remediation",
    version: "0.1.0",
  });

  const remediationPlanSchema = z.object({
    id: z.string(),
    incidentId: z.string(),
    service: z.string(),
    environment: z.string(),
    action: z.string(),
    configurationKey: z.string(),
    currentValue: z.number(),
    proposedValue: z.number(),
    reason: z.string(),
    risk: z.enum(["low", "medium", "high"]),
    reversible: z.boolean(),
    requiresApproval: z.boolean(),
  });

  server.registerTool(
    "propose_remediation",
    {
      description:
        "Retrieve the recommended remediation plan for a known incident. This tool is read-only and does not modify production systems.",
      inputSchema: {
        incidentId: z
          .string()
          .describe("Incident identifier, for example INC-2026-001"),
      },
      outputSchema: remediationPlanSchema,
    },
    async ({ incidentId }) => {
      const plan = proposeRemediation(incidentId);

      if (!plan) {
        return {
          content: [
            {
              type: "text",
              text: `No remediation plan was found for incident ${incidentId}.`,
            },
          ],
          isError: true,
        };
      }

      const structuredContent: Record<string, unknown> = {
        ...plan,
      };

      return {
        structuredContent,
        content: [
          {
            type: "text",
            text: JSON.stringify(plan, null, 2),
          },
        ],
      };
    },
  );

  const applyRemediationResultSchema = z.object({
    remediationId: z.string(),
    incidentId: z.string(),
    service: z.string(),
    environment: z.string(),
    configurationKey: z.string(),
    previousValue: z.number(),
    appliedValue: z.number(),
    status: z.literal("applied"),
    message: z.string(),
  });
  server.registerTool(
    "apply_remediation",
    {
      description:
        "Apply an approved remediation to the simulated production environment. This is a production-changing operation and requires explicit human approval.",
      inputSchema: {
        remediationId: z
          .string()
          .describe(
            "Approved remediation identifier, for example REM-2026-001",
          ),
      },
      outputSchema: applyRemediationResultSchema,
      annotations: {
        title: "Apply production remediation",
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ remediationId }) => {
      const result = applyRemediation(remediationId);

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: `Remediation ${remediationId} was not found.`,
            },
          ],
          isError: true,
        };
      }

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
    service: "sentinelforge-remediation",
  });
});

app.listen(PORT, () => {
  console.error(
    `SentinelForge Remediation MCP server listening on port ${PORT}`,
  );
});
