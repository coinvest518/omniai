import { z } from 'zod'; // Zod for input validation
import { createTRPCRouter, publicProcedure } from '../../../src/server/api/trpc.server';

export const youtubeRouter = createTRPCRouter({
  // Define a new query 'getTranscript' to fetch the YouTube transcript
  getTranscript: publicProcedure
    .input(z.string()) // Ensure input is a string (videoId)
    .query(async ({ input }) => {
      const videoId = input;

      // Fetch transcript data from our Next.js API route
      const response = await fetch(`/api/youtubeTranscript?videoId=${videoId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }

      const data = await response.json();
      return data; // Return the transcript data
    }),
});
