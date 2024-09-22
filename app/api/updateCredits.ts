// pages/api/updateCredits.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, tokensUsed } = req.body; // Expecting userId and tokensUsed in the request body

  if (req.method === 'POST') {
    if (!userId || typeof tokensUsed !== 'number') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.credits < tokensUsed) {
        return res.status(403).json({ error: 'Insufficient credits' });
      }

      // Deduct credits
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: tokensUsed } },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating user credits:', error);
      return res.status(500).json({ error: 'Failed to update credits' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}