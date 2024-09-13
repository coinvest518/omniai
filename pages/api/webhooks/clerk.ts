import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client'; // Import Prisma Client

// Initialize Prisma Client
const prisma = new PrismaClient();

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: 'WEBHOOK_SECRET is not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response(JSON.stringify({ error: 'Missing svix headers' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
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
    return new Response(JSON.stringify({ error: 'Error verifying webhook' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const eventType = evt.type;

  // Process the webhook event based on its type
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data as any;

    // Ensure required data fields are present
    if (!id || !email_addresses?.length) {
      return new Response(JSON.stringify({ error: 'Missing required user data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      // Create a user record in the database using Prisma
      const createdUser = await prisma.user.create({
        data: {
          clerkUserId: id,
          email: email_addresses[0].email_address,
          firstName: first_name || undefined,
          lastName: last_name || undefined,
        },
      });

      console.log('User created in database:', createdUser);
      return new Response(JSON.stringify({ message: 'User created successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error creating user in database:', error);
      return new Response(JSON.stringify({ error: 'Error creating user in database' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ message: 'Webhook processed' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
