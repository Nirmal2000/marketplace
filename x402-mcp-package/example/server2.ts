import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import cors from 'cors';
import express, { type Express } from 'express';
import z from 'zod';
import { makePaymentAwareServerTransport } from '../src/index.js';
import { config } from './config.js';
import * as service from './service.js';

async function createMcpServer() {
  const mcpServer = new McpServer({
    name: 'Todo app Server 2',
    version: '0.0.1',
  });

  mcpServer.tool(
    'list-todos-2',
    `[Server 2] List all the current todos (requires payment: ${config.payment.mcpPricing['list-todos']})`,
    {},
    async (_input, extra) => {
      const user = extra.authInfo?.extra?.sub as string;
      const todos = service.getTodos(user);
      return {
        content: [
          {
            type: 'text',
            text: `[Server 2] ${JSON.stringify(todos)}`,
          },
        ],
      };
    }
  );

  mcpServer.tool(
    'add-todo-2',
    `[Server 2] Add a todo (requires payment: ${config.payment.mcpPricing['add-todo']})`,
    {
      todo: z.string().describe('The content of the todo to be added'),
    },
    async ({ todo }, extra) => {
      const user = extra.authInfo?.extra?.sub as string;
      service.createTodo(user, `[Server 2] ${todo}`);
      return {
        content: [
          {
            type: 'text',
            text: `[Server 2] Added ${todo}`,
          },
        ],
      };
    }
  );

  mcpServer.tool(
    'delete-todo-2',
    `[Server 2] Delete a todo by index (requires payment: ${config.payment.mcpPricing['delete-todo']})`,
    {
      index: z.number().describe('The index of the todo to be removed (zero-indexed)'),
    },
    async ({ index }, extra) => {
      const user = extra.authInfo?.extra?.sub as string;
      service.deleteTodo(user, index);
      return {
        content: [
          {
            type: 'text',
            text: `[Server 2] Removed todo at ${index}`,
          },
        ],
      };
    }
  );

  // Create X402 transport with payment configuration for server 2
  const transport = makePaymentAwareServerTransport(
    config.payment.walletAddress, 
    {
      'list-todos-2': config.payment.mcpPricing['list-todos'],
      'add-todo-2': config.payment.mcpPricing['add-todo'],
      'delete-todo-2': config.payment.mcpPricing['delete-todo'],
    }
  );

  await mcpServer.connect(transport);

  return { transport, mcpServer };
}

const app: Express = express();

app.use(express.json());
app.use(cors());

// Create singleton MCP server instance
let mcpInstance: { transport: any; mcpServer: any } | null = null;

async function getMcpInstance() {
  if (!mcpInstance) {
    console.log('🚀 Creating MCP Server 2 singleton instance');
    mcpInstance = await createMcpServer();
  }
  return mcpInstance;
}

app.post('/mcp', async (req, res) => {
  const { transport } = await getMcpInstance();

  await transport.handleRequest(req, res, req.body);
});

const port = process.env.PORT ?? 3023;
app.listen(port, () => console.error(`Todo MCP Server 2 listening on port ${port}`));
