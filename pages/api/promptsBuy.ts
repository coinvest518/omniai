import { NextApiRequest, NextApiResponse } from 'next';
import   prisma   from  '../../lib/prisma';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.body); // Debugging: Log the request body to check what is being sent

  const { userId, promptTitle, promptData, imgSrc, creditPrice, category } = req.body;

  if (!userId || !promptTitle || !promptData || !imgSrc || !creditPrice || !category) {
    console.log('Missing fields:', { userId, promptTitle, promptData, imgSrc, creditPrice, category }); // Log missing fields
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Log the incoming userId
    console.log('Incoming userId:', userId);

    // Find the user by their Clerk user ID
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
    });

    console.log('User Query Result:', user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.credits < creditPrice) {
      return res.status(402).json({ message: 'Insufficient credits' });
    }

    // Deduct the credits from the user
    const prompt = promptTitle;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: user.credits - creditPrice,
          purchasedPromptIds: {
              push: prompt,
          },
      },
  });

  console.log('Updated User:', updatedUser)

    // Create the userPrompt record
    await prisma.userPrompt.create({
      data: {
        userId: user.id,
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
  } catch (error: unknown) {
    console.error('Error during purchase:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: 'Failed to complete purchase' });
  }
}