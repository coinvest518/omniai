import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = req.body.userId || getAuth(req).userId; // Get userId from body or Clerk


  console.log('Authenticated User ID:', userId);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let newStreak = user.dailyStreak;
    let rewardAmount = 10;

    if (!user.lastClaimDate || user.lastClaimDate < yesterday) {
      // New day, increment streak
      newStreak += 1;
      rewardAmount = calculateReward(newStreak); // Implement your reward logic
    } else if (user.lastClaimDate >= yesterday && user.lastClaimDate < today) {
      // Already claimed today
      return res.status(400).json({ message: 'Reward already claimed today' });
    }

    const updatedUser = await prisma.user.update({
      where: { clerkUserId: user.clerkUserId },
      data: {
        dailyStreak: newStreak,
        lastClaimDate: today,
        credits: { increment: rewardAmount },
      },
    });

    return res.status(200).json({
      message: 'Reward claimed successfully',
      streak: updatedUser.dailyStreak,
      reward: rewardAmount,
      credits: updatedUser.credits,
    });
  } catch (error) {
    console.error('Error claiming daily reward:', error);
    return res.status(500).json({ message: 'Failed to claim reward' });
  }
}

function calculateReward(streak: number): number {
  // Implement your reward calculation logic here
  // For example:
  return Math.floor(10 * Math.pow(1.5, streak - 1));
}
