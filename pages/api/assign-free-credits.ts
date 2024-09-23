import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request:', { method: req.method, body: req.body });

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { userId } = getAuth(req);
    console.log('User ID from Clerk:', userId);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { credits = 10, tokens = 100 } = req.body; // Default values if not provided

    if (typeof credits !== 'number' || typeof tokens !== 'number') {
      return res.status(400).json({ message: 'Invalid credits or tokens format' });
    }

    // Check if the user is new (created within the last week)
    const userCreationThreshold = new Date();
    userCreationThreshold.setDate(userCreationThreshold.getDate() - 7); // 7 days ago

    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (existingUser) {
      // Existing user - check if they received free credits in the last week
      if (existingUser.lastCreditsAssigned && existingUser.lastCreditsAssigned > userCreationThreshold) {
        return res.status(403).json({ message: 'Free credits already assigned within the past week' });
      }
    }

    // User is either new or hasn't received free credits in a week
    const updatedUser = await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        credits: { increment: credits },
        tokens: { increment: tokens },
        lastCreditsAssigned: new Date(), // Update the last assignment date
      },
    });

    console.log('Credits and tokens assigned successfully:', updatedUser);
    return res.status(200).json(updatedUser);

  } catch (error: unknown) {
    console.error('Error handling credit and token assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ message: 'Internal Server Error', error: errorMessage });
  }
}
