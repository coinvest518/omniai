import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { planDetails } from '../../lib/planDetails';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  console.log('Received userId:', userId);

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const startTime = Date.now(); // Start timing
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId as string },
    });
    const duration = Date.now() - startTime; // Calculate duration
    console.log(`Database query duration: ${duration}ms`);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const plan = planDetails.find(p => p.priceId === user.stripePriceId);

    const userData = {
      ...user,
      planName: plan?.planName || 'No active plan',
    };

    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
