import { Webhook } from 'svix';
import { NextApiRequest, NextApiResponse } from 'next';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { enqueueUserCreation } from 'lib/queue'; // Import the enqueue function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // Return 405 for any other methods
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('Webhook received');
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local' });
  }

  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Error occurred -- missing svix headers' });
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
    return res.status(400).json({ error: 'Error occurred during webhook verification' });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    console.log('Processing user.created event');
    const { id, email_addresses, first_name, last_name } = evt.data;

    if (!id || !email_addresses) {
      return res.status(400).json({ error: 'Error occurred -- missing data' });
    }

    const email = email_addresses[0].email_address || ''; // Provide a fallback value

    if (!email) {
      return res.status(400).json({ error: 'Error occurred -- missing email' });
    }

    try {
      // Check if user already exists
      let user = await prisma.user.findUnique({ where: { clerkUserId: id } });

      if (!user) {
        // Create new user if not found
        user = await prisma.user.create({
          data: {
            clerkUserId: id,
            email: email,
            firstName: first_name || undefined,
            lastName: last_name || undefined,
          },
        });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error processing user:', error);
      return res.status(500).json({ error: 'An error occurred while processing the user' });
    }
  }

  // Return success response if event type is not 'user.created'
  return res.status(200).json({ message: 'Webhook processed successfully' });
}
