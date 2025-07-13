import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Client } from '@hubspot/api-client';

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
console.log('HubSpot client initialized with token:', !!process.env.HUBSPOT_ACCESS_TOKEN);

const tools = [
  {
    name: 'hubspot_get_contacts',
    description: 'Retrieve a list of contacts from HubSpot CRM',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of contacts to return (default 10)' },
      },
    },
    async call(input: { limit?: number }) {
      try {
        const limit = input.limit || 10;
        const response = await hubspotClient.crm.contacts.basicApi.getPage(limit);
        console.log('HubSpot get_contacts success:', response.results.length);
        return response.results;
      } catch (error) {
        console.error('HubSpot get_contacts error:', error.message);
        throw error;
      }
    },
  },
  {
    name: 'hubspot_create_contact',
    description: 'Create a new contact in HubSpot CRM',
    input_schema: {
      type: 'object',
      properties: {
        firstname: { type: 'string' },
        lastname: { type: 'string' },
        email: { type: 'string' },
      },
      required: ['email'],
    },
    async call(input: { firstname?: string; lastname?: string; email: string }) {
      try {
        const properties = {
          firstname: input.firstname,
          lastname: input.lastname,
          email: input.email,
        };
        const response = await hubspotClient.crm.contacts.basicApi.create({ properties });
        console.log('HubSpot create_contact success:', response.id);
        return response;
      } catch (error) {
        console.error('HubSpot create_contact error:', error.message);
        throw error;
      }
    },
  },
];

const prompts = [
  { content: 'You are a HubSpot CRM assistant. Use tools to interact with data.' },
];

const resources = [];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  const server = new McpServer({
    name: 'hubspot-mcp-server',
    version: '1.0.0',
    tools,
    prompts,
    resources,
  });

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode (no Redis needed)
  });

  await server.connect(transport);

  await transport.handleRequest(req, res, req.body);

  // Cleanup on response close
  res.on('close', () => {
    transport.close();
  });
}