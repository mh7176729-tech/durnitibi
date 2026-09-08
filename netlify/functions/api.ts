import serverless from 'serverless-http';
import { createApiApp } from '../../src/server/createApp';

// Initialize the Express API application with all endpoints
const app = createApiApp();

// Export AWS Lambda / Netlify Serverless Function handler
export const handler = serverless(app);
