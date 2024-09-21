import { Webhook } from 'svix';
import { NextApiRequest, NextApiResponse } from 'next';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from 'lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Webhook secret missing from environment variables');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const { 'svix-id': svix_id, 'svix-timestamp': svix_timestamp, 'svix-signature': svix_signature } = req.headers;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const body = JSON.stringify(req.body);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id as string,
      'svix-timestamp': svix_timestamp as string,
      'svix-signature': svix_signature as string,
    }) as WebhookEvent;
  } catch (err) {
    console.error(`Webhook verification failed: ${err}`);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  const eventType = evt.type;

  switch (eventType) {
    case 'user.created': {
      const { id, email_addresses, first_name, last_name } = evt.data;

      if (!id || !email_addresses || email_addresses.length === 0) {
        console.error('Missing required user data in event');
        return res.status(400).json({ error: 'Missing required user data' });
      }

      const email = email_addresses[0].email_address;

      try {
        let user = await prisma.user.findUnique({
          where: { clerkUserId: id },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              clerkUserId: id,
              email,
              firstName: first_name || null,
              lastName: last_name || null,
            },
          });
        }

        return res.status(200).json({ user });
      } catch (error) {
        console.error('Error processing user creation:', error);
        return res.status(500).json({ error: 'Error creating user in database' });
      }
    }
    
    default:
      console.log(`Unhandled event type: ${eventType}`);
      return res.status(200).json({ message: 'Webhook processed' });
  }
}
