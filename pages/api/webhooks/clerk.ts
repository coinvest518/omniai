import { Webhook } from 'svix';
import { NextApiRequest, NextApiResponse } from 'next';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('Webhook received');
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Please add CLERK_WEBHOOK_SECRET to .env' });
  }

  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const body = JSON.stringify(req.body);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    console.log('Verifying webhook');
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    console.log('Webhook verified');
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  if (evt.type === 'user.created') {
    console.log('Processing user.created event');
    const { id, email_addresses, first_name, last_name } = evt.data;

    if (!id || !email_addresses) {
      return res.status(400).json({ error: 'Missing user data' });
    }

    const email = email_addresses[0].email_address || '';

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    try {
      // Directly create the user in Prisma
      let user = await prisma.user.findUnique({ where: { clerkUserId: id } });

      if (!user) {
        console.log('Creating new user:', { clerkUserId: id, email, firstName: first_name, lastName: last_name });
        user = await prisma.user.create({
          data: {
            clerkUserId: id,
            email: email,
            firstName: first_name || undefined,
            lastName: last_name || undefined,
          },
        });
        console.log('User created successfully:', user);
      } else {
        console.log('User already exists:', user);
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error processing user:', error);
      return res.status(500).json({ error: 'An error occurred while processing the user' });
    }
  }

  return res.status(200).json({ message: 'Webhook processed successfully' });
}
