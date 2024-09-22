// lib/queue.js
import Bull from 'bull';
import prisma from './prisma'; // Adjust the import based on your project structure

// Create a new queue
const userCreationQueue = new Bull('userCreationQueue', {
  redis: {
    host: '127.0.0.1', // Replace with your Redis host
    port: 6379,        // Replace with your Redis port
  },
});

// Process the queue
userCreationQueue.process(async (job) => {
  const { id, email, first_name, last_name } = job.data;

  // Create the user in the database
  try {
    let user = await prisma.user.findUnique({ where: { clerkUserId: id } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkUserId: id,
          email: email,
          firstName: first_name || undefined,
          lastName: last_name || undefined,
        },
      });
    }

    console.log('User created:', user);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error; // Rethrow the error to let Bull handle retries
  }
});

// Function to enqueue user creation
export const enqueueUserCreation = (/** @type {{ id: string; email: string; first_name: string | null; last_name: string | null; }} */ userData) => { // Removed TypeScript annotations
  return userCreationQueue.add(userData);
};