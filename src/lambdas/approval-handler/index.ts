import { Server } from 'http';
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import express from 'express';

import { handleButtonClicked, handleDialog } from '../shared/approval-interactions';

const app = express();

// Use express middleware for handling Slack interactions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle Slack interactive components
app.post('/slack/actions', async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    
    if (payload.callback_id === 'slack_approval') {
      const result = await handleButtonClicked(payload);
      res.json(result);
    } else if (payload.callback_id.endsWith('_dialog')) {
      await handleDialog(payload);
      res.status(200).send();
    } else {
      res.status(400).send('Unknown callback_id');
    }
  } catch (error) {
    console.error('Error handling Slack interaction:', error);
    res.status(500).send('Internal server error');
  }
});

const server = createServer(app);

export const handler = (event: APIGatewayProxyEvent, context: Context): Server => {
  return proxy(server, event, context);
};
