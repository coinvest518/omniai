import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  const { priceId, planId } = req.body;

  if (!userId || !priceId || !planId) {
    return res.status(401).json({ message: 'Unauthorized or missing parameters' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [ 'card',  'cashapp', 'paypal', 'link'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/userPrompts`,
      metadata: {
        userId: userId,
        planId: planId,
      },
    });

    // Update user's subscription information in Prisma
    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        stripeSessionId: session.id,
        stripePriceId: priceId,
        stripeSubscriptionId: session.subscription as string,
        stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
}
