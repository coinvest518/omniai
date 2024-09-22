import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId } = await getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { credits, tokens } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { credits, tokens },
      });

      return res.status(200).json({ message: 'User credits and tokens updated' });
    } catch (error) {
      console.error('Error updating user credits and tokens:', error);
      return res.status(500).json({ error: 'Failed to update user credits and tokens' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}