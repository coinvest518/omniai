import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';





const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }  
  const { promptTitle, promptData, imgSrc, creditPrice, category } = req.body;
  const { userId } = getAuth(req);

  console.log('Request Payload:', req.body);
  console.log('Authenticated User ID:', userId);

  // Validate required fields
  if (!userId || !promptTitle || !promptData || !imgSrc || !creditPrice || !category) {
    console.error('Unauthorized or missing parameters');
    return res.status(401).json({ message: 'Unauthorized or missing parameters' });
  }

  try {
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has enough credits
    if (user.credits < creditPrice) {
      return res.status(402).json({ message: 'Insufficient credits' });
    }

    // Deduct credits
    await prisma.user.update({
      where: { clerkUserId: user.clerkUserId },
      data: {
        credits: user.credits - creditPrice,
      },
    });

    // Create user prompt record
    await prisma.userPrompt.create({
      data: {
        promptTitle,
        promptData,
        imgSrc,
        description: '', // Add a default empty string for the required description field
        creditPrice,
        category,
        clerkUserId: user.clerkUserId,
      },
    });

    res.json({ message: 'Purchase successful' });
  } catch (error) {
    console.error('Error during purchase:', error);
    res.status(500).json({ message: 'Failed to complete purchase' });
  }
}
