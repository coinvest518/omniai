import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error('WEBHOOK_SECRET is not set.');
      return res.status(500).json({ error: 'Server misconfiguration: WEBHOOK_SECRET not set' });
    }

    // Extract Svix headers
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing Svix headers');
      return res.status(400).json({ error: 'Missing Svix headers' });
    }

    // Get the payload
    let payload;
    try {
      payload = req.body;
    } catch (error) {
      console.error('Failed to parse JSON body:', error);
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    // Verify the webhook payload
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    const eventType = evt.type;

    // Handle `user.created` event
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;

      if (!id || !email_addresses || email_addresses.length === 0) {
        return res.status(400).json({ error: 'Missing user data in webhook' });
      }

      try {
        // Use Prisma to create a new user in the database
        const createdUser = await prisma.user.create({
          data: {
            clerkUserId: id,
            email: email_addresses[0].email_address,
            firstName: first_name || undefined,
            lastName: last_name || undefined,
          },
        });

        console.log('User created successfully:', createdUser);
        return res.status(200).json({ message: 'Webhook handled successfully' });
      } catch (error) {
        console.error('Database error when creating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    return res.status(200).json({ message: 'Webhook handled successfully' });
  } else if (req.method === 'GET') {
    // Handle GET requests (if Clerk/Svix hits the webhook endpoint with GET)
    return res.status(405).json({ error: 'GET method not allowed for this endpoint' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
