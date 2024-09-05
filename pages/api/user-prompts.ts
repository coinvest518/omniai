import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

const prisma = new PrismaClient();
const mongoUri = process.env.MONGODB_URI || '';
if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
}
const mongoClient = new MongoClient(mongoUri);

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const userId = req.query.userId as string;
        await mongoClient.connect();
        const mongoDb = mongoClient.db('yourMongoDbName');
        const mongoPrompts = await mongoDb.collection('prompts').find({ userId: req.query.userId }).toArray();

        const prismaPrompts = await prisma.userPrompt.findMany({
            where: { userId: userId ? { equals: userId } : undefined },
        });

        const combinedPrompts = [...mongoPrompts, ...prismaPrompts];

        res.status(200).json(combinedPrompts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prompts' });
    } finally {
        await mongoClient.close();
    }
};