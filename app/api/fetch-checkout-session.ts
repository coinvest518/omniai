import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import { planDetails } from '../../../lib/planDetails';
import { creditDetails } from '../../../lib/creditDetails'; // Assuming you have a similar file for credit details

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { session_id } = req.query;
  const { userId } = getAuth(req);

  if (!session_id || !userId) {
    return res.status(400).json({ message: 'Missing session ID or user ID' });
  }

  try {
    console.log(`Fetching checkout session for session_id: ${session_id}`);
    const session = await stripe.checkout.sessions.retrieve(session_id as string);

    if (!session) {
      return res.status(404).json({ message: 'Checkout session not found' });
    }

    console.log(`Fetching line items for session_id: ${session_id}`);
    const lineItems = await stripe.checkout.sessions.listLineItems(session_id as string);
    if (!lineItems || lineItems.data.length === 0) {
      return res.status(400).json({ message: 'No line items found in session' });
    }

    const priceId = lineItems.data[0].price?.id;
    if (!priceId) {
      return res.status(400).json({ message: 'Price ID not found in session' });
    }

    console.log(`Looking for plan or credit package with priceId: ${priceId}`);
    const plan = planDetails.find(p => p.priceId === priceId);
    const creditPackage = creditDetails.find(c => c.priceId === priceId);

    if (!plan && !creditPackage) {
      return res.status(404).json({ message: `No plan or credit package found for priceId: ${priceId}` });
    }

    // Fetch current credits and tokens of the user
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId as string },
      select: { tokens: true, credits: true, stripePriceId: true, stripeSubscriptionId: true, stripeCurrentPeriodEnd: true },
    });

    let updatedCredits = user?.credits || 0;
    let updatedTokens = user?.tokens || 0;
    let planName = user?.stripePriceId ? planDetails.find(p => p.priceId === user.stripePriceId)?.planName || 'No active plan' : 'No active plan';

    if (plan) {
      updatedCredits += plan.credits + plan.freeCredits;
      updatedTokens += plan.tokens;
      planName = plan.planName;
    } else if (creditPackage) {
      updatedCredits += creditPackage.credits;
      planName = 'Credit Package'; // Set a meaningful name for credit package purchases
    }

    console.log(`Updating user with clerkUserId: ${userId}`);
    const updatedUser = await prisma.user.update({
      where: { clerkUserId: userId as string }, // Ensure this matches the correct field type
      data: {
        stripePriceId: plan ? priceId : user?.stripePriceId,
        stripeSubscriptionId: plan ? session.subscription as string : user?.stripeSubscriptionId,
        stripeCurrentPeriodEnd: plan ? new Date((session.expires_at || 0) * 1000) : user?.stripeCurrentPeriodEnd,
        credits: updatedCredits,
        tokenUsage: 0,
        tokens: updatedTokens,
      },
    });

    const responseData = {
      tokens: updatedTokens,
      credits: updatedCredits, // Ensure credits are included in the response
      planName: planName,
      // other fields to include in the response
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching checkout session:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error instanceof Error ? error.message : String(error) });
  }
}