import { Webhook } from 'svix'
import { buffer } from 'micro'
import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
};

const secret = process.env.WEBHOOK_SECRET || 'your-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const payload = (await buffer(req)).toString();
  const headers = {
    'svix-id': req.headers['svix-id'] as string,
    'svix-timestamp': req.headers['svix-timestamp'] as string,
    'svix-signature': req.headers['svix-signature'] as string,
  };

  const wh = new Webhook(secret);
  interface WebhookMessage {
    data: { id: string };
    type: string;
  }
  let msg: WebhookMessage;
  try {
    msg = wh.verify(payload, headers) as WebhookMessage;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).send('Bad Request: Invalid signature');
  }

  // Do something with the verified message
  const { id } = msg.data;
  const eventType = msg.type;
  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', payload);

  return res.status(200).json({ message: 'Webhook received successfully' });
}