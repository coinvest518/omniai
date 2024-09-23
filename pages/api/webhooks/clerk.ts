import { Webhook } from 'svix';
import { NextApiRequest, NextApiResponse } from 'next';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from '../../../lib/prisma';
import { enqueueUserCreation } from 'lib/queue'; // Queue function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('Webhook received');
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Missing webhook secret' });
  }

  const { 'svix-id': svixId, 'svix-timestamp': svixTimestamp, 'svix-signature': svixSignature } = req.headers;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const body = JSON.stringify(req.body);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svixId as string,
      'svix-timestamp': svixTimestamp as string,
      'svix-signature': svixSignature as string,
    }) as WebhookEvent;
    console.log('Webhook verified');
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  if (evt.type === 'user.created') {
    console.log('Processing user.created event');
    const { id, email_addresses, first_name, last_name } = evt.data;

    if (!id || !email_addresses.length) {
      return res.status(400).json({ error: 'Missing user data' });
    }

    const email = email_addresses[0].email_address || '';

    // Offload user creation to a queue
    enqueueUserCreation({ id, email, first_name, last_name });

    return res.status(200).json({ message: 'User creation queued' });
  }

  return res.status(200).json({ message: 'Webhook processed successfully' });
}
