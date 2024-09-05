import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { useAuth } from '@clerk/nextjs';
import { useUserStore } from '~/common/state/userStore';

const prisma = new PrismaClient();

const tokenMiddleware = async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  const { userId } = useAuth();

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Example token usage calculation (adjust as needed)
  const tokensUsed = calculateTokens(req.body.message);

  if (user.credits < tokensUsed) {
    return res.status(403).json({ error: 'Insufficient credits' });
  }

  // Deduct credits based on tokens used
  await useUserStore.getState().updateCredits(-tokensUsed);

  next();
};

export default tokenMiddleware;

// Helper function to calculate tokens (adjust as needed)
function calculateTokens(inputText: string): number {
  // Example calculation (adjust as needed)
  return Math.ceil(inputText.length / 100);
}