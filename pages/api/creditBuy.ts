import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { CreditDetail, creditDetails } from '../../lib/creditDetails';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  const { priceId } = req.body;

  console.log('Request Payload:', req.body);
  console.log('Authenticated User ID:', userId);

  if (!userId || !priceId) {
    console.error('Unauthorized or missing parameters');
    return res.status(401).json({ message: 'Unauthorized or missing parameters' });
  }

  try {
    const creditDetail = creditDetails.find((c: CreditDetail) => c.priceId === priceId);

    if (!creditDetail) {
      return res.status(404).json({ message: 'Credit package not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/userPage`,
      metadata: {
        userId: userId,
      },
    });

    console.log('Stripe Session ID:', session.id);

    
    // Create a Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    // Update the user's credits only after the payment has been successfully processed
    try {
      const payment = await stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method: req.body.payment_method,
      });

      if (payment.status === 'succeeded') {
        // Update the user's credits
        const user = await prisma.user.findUnique({
          where: { clerkUserId: userId },
          select: { credits: true },
        });

    if (user) {
      const updatedCredits = (user.credits || 0) + creditDetail.credits;

      await prisma.user.update({
        where: { clerkUserId: userId },
        data: {
          credits: updatedCredits,
          stripeSessionId: session.id, // Ensure this matches the Stripe session ID
        },
      });
    
      console.log('Updated User Credits:', updatedCredits);
    } else {
      console.error('User not found:', userId);
    }
  }
} catch (error) {
  // Handle payment failure
}

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
}
