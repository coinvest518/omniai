import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { planDetails } from '../../../lib/planDetails'; // Adjust the path as per your actual file structure

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    return res.status(400).send('Webhook Error: Unknown error');
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSession(session);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
}

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  if (!userId) {
    console.error('client_reference_id is missing in session');
    return;
  }

  // Retrieve line_items
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const priceId = lineItems.data[0]?.price?.id; // Adjust as necessary

  if (!priceId) {
    console.error('Price ID not found in session line items');
    return;
  }

  // Retrieve plan details
  const plan = planDetails[priceId as keyof typeof planDetails];

  if (!plan) {
    console.error(`Plan details not found for priceId: ${priceId}`);
    return;
  }

  try {
    // Update user in the database
    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        stripeSessionId: session.id,
        stripePriceId: priceId,
        
      },
    });
  } catch (error) {
    console.error('Error updating user data:', error);
  }
}
