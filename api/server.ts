import { createMcpServer } from '@mcp-sdk/server';
import { Client } from '@hubspot/api-client'; // Official HubSpot client

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
console.log('HubSpot client initialized with token:', !!process.env.HUBSPOT_ACCESS_TOKEN); // Debug log: true if token exists

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
      const limit = input.limit || 10;
      const response = await hubspotClient.crm.contacts.basicApi.getPage(limit);
      return response.results;
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
      const properties = {
        firstname: input.firstname,
        lastname: input.lastname,
        email: input.email,
      };
      const response = await hubspotClient.crm.contacts.basicApi.create({ properties });
      return response;
    },
  },
  // Add more tools as needed, e.g., for companies or deals
  // Example: hubspot_get_companies using hubspotClient.crm.companies.basicApi.getPage()
];

const prompts = [
  // Optional: System prompts for AI context
  { content: 'You are a HubSpot CRM assistant. Use tools to interact with data.' },
];

const resources = [
  // Optional: Add resources like vector stores if needed later
];

const mcpServer = createMcpServer({ tools, prompts, resources });

export default mcpServer;