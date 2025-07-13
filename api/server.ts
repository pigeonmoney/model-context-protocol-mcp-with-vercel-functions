import { createMcpHandler } from '@vercel/mcp-adapter';
import { z } from 'zod';
import { Client } from '@hubspot/api-client';

const handler = createMcpHandler(
  (server) => {
    const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
    console.log('HubSpot client initialized with token:', !!process.env.HUBSPOT_ACCESS_TOKEN); // Debug log

    server.tool(
      'hubspot_get_contacts',
      'Retrieve a list of contacts from HubSpot CRM',
      z.object({
        limit: z.number().int().min(1).optional().default(10),
      }),
      async ({ limit }) => {
        try {
          const response = await hubspotClient.crm.contacts.basicApi.getPage(limit);
          console.log('HubSpot get_contacts success:', response.results.length);
          return {
            content: [{ type: 'text', text: JSON.stringify(response.results) }],
          };
        } catch (error) {
          console.error('HubSpot get_contacts error:', error.message);
          throw error;
        }
      },
    );

    server.tool(
      'hubspot_create_contact',
      'Create a new contact in HubSpot CRM',
      z.object({
        firstname: z.string().optional(),
        lastname: z.string().optional(),
        email: z.string(),
      }),
      async ({ firstname, lastname, email }) => {
        try {
          const properties = {
            firstname,
            lastname,
            email,
          };
          const response = await hubspotClient.crm.contacts.basicApi.create({ properties });
          console.log('HubSpot create_contact success:', response.id);
          return {
            content: [{ type: 'text', text: JSON.stringify(response) }],
          };
        } catch (error) {
          console.error('HubSpot create_contact error:', error.message);
          throw error;
        }
      },
    );

    // Add prompts if needed
    server.prompt('You are a HubSpot CRM assistant. Use tools to interact with data.');
  },
  {}, // Optional config (e.g., for resources)
  { basePath: '/' }, // Adjust if your route is /api/server
);

export { handler as GET, handler as POST, handler as DELETE };