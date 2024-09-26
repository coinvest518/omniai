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
      select: { purchasedPromptIds: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    try {
      const userPrompts = await prisma.userPrompt.findMany({
        where: { clerkUserId: userId as string },
        select: { 
          id: true,
          promptTitle: true,
          imgSrc: true,
          description: true,
          creditPrice: true,
          category: true,
        },
      });
  
      return res.status(200).json({ userPrompts });
    } catch (error) {
      console.error('Error fetching user prompts:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

