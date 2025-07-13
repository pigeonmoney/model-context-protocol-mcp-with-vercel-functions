import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; // Correct import

import { Client } from '@hubspot/api-client'; // Official HubSpot client

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
console.log('HubSpot client initialized with token:', !!process.env.HUBSPOT_ACCESS_TOKEN); // Debug log

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

const mcpServer = new McpServer({ tools, prompts, resources }); // Correct instantiation

export default mcpServer;