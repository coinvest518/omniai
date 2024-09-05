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

    const { email } = req.body;

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
      const user = await prisma.user.upsert({
        where: { clerkUserId: userId },
        update: { email },
        create: {
          email,
          clerkUserId: userId,
          credits: 3,
        },
      });
      console.log('User upserted successfully:', user);
      return res.status(200).json(user);
    } catch (prismaError) {
      console.error('Prisma operation failed:', prismaError);
      return res.status(500).json({ message: 'Database operation failed' });
    }
  } catch (error: unknown) {
    console.error('Error handling user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ message: 'Internal Server Error', error: errorMessage });
  }
}
