import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getAuth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: [ 'card',  'klarna', 'alipay', 'afterpay_clearpay', 'cashapp', 'paypal', 'zip', 'link'],
      metadata: { userId: auth.userId },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
