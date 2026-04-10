import crypto from 'crypto';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getEnv } from 'get-env-or-die';

import { handleButtonClicked, handleDialog } from '../shared/approval-interactions';

const SLACK_SIGNING_SECRET = getEnv('SLACK_SIGNING_SECRET');

function verifySlackSignature(event: APIGatewayProxyEvent): void {
  const signature = event.headers['X-Slack-Signature'] ?? event.headers['x-slack-signature'] ?? '';
  const timestamp = event.headers['X-Slack-Request-Timestamp'] ?? event.headers['x-slack-request-timestamp'] ?? '';
  const body = event.body ?? '';

  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (Number(timestamp) < fiveMinutesAgo) {
    throw new Error('Slack request signing verification outdated');
  }

  const hmac = crypto.createHmac('sha256', SLACK_SIGNING_SECRET);
  hmac.update(`v0:${timestamp}:${body}`);
  const expected = `v0=${hmac.digest('hex')}`;

  if (!crypto.timingSafeEqual(Uint8Array.from(Buffer.from(signature)), Uint8Array.from(Buffer.from(expected)))) {
    throw new Error('Slack request signing verification failed');
  }
}

function parsePayload(event: APIGatewayProxyEvent): Record<string, unknown> {
  const body = event.body ?? '';
  const params = new URLSearchParams(body);
  const payloadStr = params.get('payload');
  if (!payloadStr) {
    throw new Error('Missing payload');
  }
  return JSON.parse(payloadStr);
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    verifySlackSignature(event);

    const payload = parsePayload(event);
    const callbackId = payload.callback_id as string;

    if (callbackId === 'slack_approval') {
      const message = await handleButtonClicked(payload as never);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      };
    }

    if (callbackId && callbackId.endsWith('_dialog')) {
      await handleDialog(payload as never);
      return { statusCode: 200, body: '' };
    }

    return { statusCode: 400, body: 'Unknown action' };
  } catch (error) {
    console.error(error);
    return { statusCode: 404, body: '' };
  }
};
