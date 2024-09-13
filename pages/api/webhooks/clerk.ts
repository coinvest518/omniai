import { Webhook } from 'svix';
import { NextApiRequest, NextApiResponse } from 'next';
import { WebhookEvent } from '@clerk/nextjs/server';
import createUser from '../../api/create-user';
import { User } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  // Get the headers directly from the request
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
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Error occurred during webhook verification' });
  }

  const eventType = evt.type;

  // Process the webhook event based on its type
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Ensure required data fields are present
    if (!id || !email_addresses) {
      return res.status(400).json({ error: 'Error occurred -- missing data' });
    }

    // Prepare user data to be created
    const user: Partial<User> = {
      clerkUserId: id,
      email: email_addresses[0].email_address,
      firstName: first_name || undefined,
      lastName: last_name || undefined,
    };

    // Attempt to create the user
    try {
      const { user: createdUser, error } = await createUser(user as User);
      if (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Error occurred during user creation' });
      }
      console.log('User created:', createdUser);
      return res.status(200).json({ message: 'User created successfully', user: createdUser });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Server error during user creation' });
    }
  }

  // Return success response if event type is not 'user.created'
  return res.status(200).json({ message: 'Webhook processed successfully' });
}
