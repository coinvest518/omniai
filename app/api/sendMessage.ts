import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import tokenMiddleware from '../../../middlewares/tokensMiddleware';
import { countModelTokens } from 'src/common/util/token-counter';
import type { DLLM } from '~/modules/llms/store-llms';
import { useUserStore } from '~/common/state/userStore';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply the token middleware
  await tokenMiddleware(req, res, async () => {
    if (req.method === 'POST') {
      const { userId, message, llmId }: { userId: string; message: string; llmId: DLLM['id'] } = req.body;

      // Calculate tokens used
      const tokensUsed = countModelTokens(message, llmId, 'sendMessage');

      if (tokensUsed === null) {
        return res.status(400).json({ error: 'Token calculation failed' });
      }

      try {
        // Update user's token balance
        await useUserStore.getState().updateTokens(-tokensUsed);

        return res.status(200).json({ success: true, message: 'Message sent', tokensUsed });
      } catch (error) {
        console.error('Error updating user token balance:', error);
        return res.status(500).json({ error: 'Failed to update token balance' });
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  });
};

export default handler;