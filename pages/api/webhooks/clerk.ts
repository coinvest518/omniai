import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('WEBHOOK_SECRET is not set.');
    return new Response('Server misconfiguration: WEBHOOK_SECRET not set', { status: 500 });
  }

  // Extract Svix headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing Svix headers', { status: 400 });
  }

  // Get the payload
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    console.error('Failed to parse JSON body:', error);
    return new Response('Invalid JSON payload', { status: 400 });
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
    return new Response('Webhook verification failed', { status: 400 });
  }

  const eventType = evt.type;

  // Handle `user.created` event
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    if (!id || !email_addresses || email_addresses.length === 0) {
      return new Response('Missing user data in webhook', { status: 400 });
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
    } catch (error) {
      console.error('Database error when creating user:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  // Ensure the Prisma Client is disconnected after operation
  await prisma.$disconnect();

  return new Response('Webhook handled successfully', { status: 200 });
}
