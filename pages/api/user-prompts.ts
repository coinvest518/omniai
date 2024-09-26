import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId as string },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userPrompts = await prisma.userPrompt.findMany({
      where: { userId: user.id },
    });

    return res.status(200).json(userPrompts);
  } catch (error) {
    console.error('Error fetching user prompts:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}