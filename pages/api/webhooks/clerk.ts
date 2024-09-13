import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client'; // Import Prisma Client

// Initialize Prisma Client
const prisma = new PrismaClient();

export async function POST(req: Request) {
  // Ensure the webhook is configured to send a POST request
  // Check the Clerk Dashboard for the correct HTTP method

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  // Ensure WEBHOOK_SECRET is set correctly in your environment
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const eventType = evt.type;

  // Process the webhook event based on its type
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Ensure required data fields are present
    if (!id || !email_addresses) {
      return new Response(JSON.stringify({ error: 'Error occurred -- missing data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      // Create a user record in the database using Prisma
      const prismaUser = {
        clerkUserId: id,
        email: email_addresses[0].email_address,
        firstName: first_name || undefined, // Use undefined if optional
        lastName: last_name || undefined,
      };

      const createdUser = await prisma.user.create({
        data: prismaUser,
      });

      console.log('User created in database:', createdUser);
    } catch (error) {
      console.error('Error creating user in database:', error);
      return new Response('Error occurred during user creation', {
        status: 500,
      });
    }
  }

  return new Response('', { status: 200 });
}