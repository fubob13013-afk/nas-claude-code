import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const SERVER_NAME = "nas-bib-bridge";
// 改为你的 NAS 的 Tailscale IP 或内网 IP
const NAS_API = "http://你的NAS的IP:3000/api/chat";

const server = new Server(
  { name: SERVER_NAME, version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "nas_bib_chat",
      description:
        "Send a task or question to Bib running on the home NAS (DeepSeek v4-pro, 24/7). " +
        "Use this to delegate heavy analysis, long-running tasks, or get a second opinion. " +
        "Bib shares the same CLAUDE.md profile and memory as you.",
      inputSchema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The message, question, or task to send to NAS Bib",
          },
        },
        required: ["message"],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "nas_bib_chat") {
    const { message } = request.params.arguments;

    try {
      const resp = await fetch(NAS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: AbortSignal.timeout(180_000),
      });

      const data = await resp.json();

      if (data.reply) {
        return { content: [{ type: "text", text: data.reply }] };
      }
      return {
        content: [
          {
            type: "text",
            text: `NAS Bib returned an error: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to reach NAS Bib (${err.message}). Is Tailscale connected?`,
          },
        ],
      };
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
