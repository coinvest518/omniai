import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

const prisma = new PrismaClient();

const mongoUri = process.env.MONGODB_URI || '';
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not set');
}
const mongoClient = new MongoClient(mongoUri);

interface Prompt {
  id: string;
  prompt: string | null;
  promptData: string | null;
  purchaseId: string | null;
  purchaseDate: Date | null;
}

interface UserPrompt {
  id: string;
  userId: string;
  prompt: string | null;
  promptData: string | null;
  purchaseId: string | null;
  purchaseDate: Date | null;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const userId = req.query.userId as string;
    await mongoClient.connect();
    const mongoDb = mongoClient.db('myDatabase');
    const mongoPrompts = await mongoDb.collection('prompts').find({ userId }).toArray();

    const prismaPrompts = await prisma.userPrompt.findMany({
        where: {
            userId: { equals: userId },
        },
    }) as unknown as UserPrompt[];

    const combinedPrompts = [...mongoPrompts, ...prismaPrompts] as Prompt[];

    const mappedPrompts = combinedPrompts.map((prompt) => {
      return {
        id: prompt.id,
        prompt: prompt.prompt || prompt.promptData,
        purchaseId: prompt.purchaseId,
        purchaseDate: prompt.purchaseDate,
      };
    });

    res.status(200).json(mappedPrompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  } finally {
    await mongoClient.close();
  }
};