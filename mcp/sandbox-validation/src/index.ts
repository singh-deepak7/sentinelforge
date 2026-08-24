import express from "express";
import { randomUUID } from "node:crypto";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { runTimeoutValidation } from "./tools/run-timeout-validation.js";

const PORT = Number(process.env.PORT ?? 3003);

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "sentinelforge-sandbox-validation",
    version: "0.1.0"
  });

  const validationResultSchema = z.object({
    scenarioId: z.string(),
    timeoutMs: z.number(),
    simulatedPaymentLatencyMs: z.number(),
    outcome: z.enum(["PASS", "FAIL"]),
    timedOut: z.boolean(),
    observedDurationMs: z.number(),
    reason: z.string()
  });

  server.registerTool(
    "run_timeout_validation",
    {
      description:
        "Run a deterministic sandbox validation for a payment authorization timeout value against a controlled latency scenario.",
      inputSchema: {
        scenarioId: z
          .string()
          .describe("Validation scenario identifier, for example PAYMENT-LATENCY-850"),
        timeoutMs: z
          .number()
          .int()
          .positive()
          .describe("Client timeout value in milliseconds")
      },
      outputSchema: validationResultSchema
    },
    async ({ scenarioId, timeoutMs }) => {
      const result = runTimeoutValidation({
        scenarioId,
        timeoutMs
      });

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: `Validation scenario ${scenarioId} was not found.`
            }
          ],
          isError: true
        };
      }

      const structuredContent: Record<string, unknown> = {
        ...result
      };

      return {
        structuredContent,
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
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
      }
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
      error: "Invalid MCP request"
    });

    return;
  }

  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).json({
      error: "Missing or invalid MCP session"
    });

    return;
  }

  await transports.get(sessionId)!.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).json({
      error: "Missing or invalid MCP session"
    });

    return;
  }

  await transports.get(sessionId)!.handleRequest(req, res);
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "sentinelforge-sandbox-validation"
  });
});

app.listen(PORT, () => {
  console.error(
    `SentinelForge Sandbox Validation MCP server listening on port ${PORT}`
  );
});