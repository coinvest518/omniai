import { Webhook } from 'svix';
import { NextApiRequest, NextApiResponse } from 'next';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from 'lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Webhook received');
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  // Get the headers
  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Error occurred -- missing svix headers' });
  }

  // Get the body
  const body = JSON.stringify(req.body);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    console.log('Verifying webhook'); // Log before verification

    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    }) as WebhookEvent;
    console.log('Webhook verified'); // Log after successful verification

  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Error occurred during webhook verification' });
  }

  const eventType = evt.type;

  // Process the webhook event based on its type
  if (eventType === 'user.created') {
    console.log('Processing user.created event');
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Ensure required data fields are present
    if (!id || !email_addresses) {
      return res.status(400).json({ error: 'Error occurred -- missing data' });
    }

    const email = email_addresses[0].email_address;

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
