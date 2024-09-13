import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma Client

const prisma = new PrismaClient();

export async function POST(req: Request) {
  console.log('Webhook received');

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('WEBHOOK_SECRET is not set in the environment variables');
    return new Response(JSON.stringify({ error: 'Server misconfiguration: WEBHOOK_SECRET not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

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
  console.log('Webhook verified, event type:', eventType);

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    if (!id || !email_addresses) {
      return new Response(JSON.stringify({ error: 'Error occurred -- missing data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const prismaUser = {
        clerkUserId: id,
        email: email_addresses[0].email_address,
        firstName: first_name || undefined,
        lastName: last_name || undefined,
      };

      console.log('Creating user in database');
      const createdUser = await prisma.user.create({
        data: prismaUser,
      });
      console.log('User created in database:', createdUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error:', error.code, error.message);
      } else {
        console.error('Error creating user in database:', error);
      }
      return new Response('Error occurred during user creation', {
        status: 500,
      });
    }
  }

  console.log('Webhook processing complete');
  return new Response('', { status: 200 });
}
