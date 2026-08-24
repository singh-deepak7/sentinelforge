import express from "express";
import { randomUUID } from "node:crypto";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { getIncident } from "./tools/get-incident.js";

const PORT = Number(process.env.PORT ?? 3001);

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "sentinelforge-incident-observability",
    version: "0.1.0"
  });

  server.tool(
    "get_incident",
    "Retrieve the current details of a production incident by incident ID.",
    {
      incidentId: z
        .string()
        .describe("Incident identifier, for example INC-2026-001")
    },
    async ({ incidentId }) => {
      const incident = getIncident(incidentId);

      if (!incident) {
        return {
          content: [
            {
              type: "text",
              text: `Incident ${incidentId} was not found.`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(incident, null, 2)
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

  const transport = transports.get(sessionId)!;

  await transport.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).json({
      error: "Missing or invalid MCP session"
    });

    return;
  }

  const transport = transports.get(sessionId)!;

  await transport.handleRequest(req, res);
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "sentinelforge-incident-observability"
  });
});

app.listen(PORT, () => {
  console.error(
    `SentinelForge Incident Observability MCP server listening on port ${PORT}`
  );
});