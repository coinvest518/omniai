import { createTRPCRouter, publicProcedure } from '~/server/api/trpc.server';
import { z } from 'zod';
import { fetchYouTubeTranscript } from './youtube.fetcher';
import { TRPCError } from '@trpc/server';

const inputSchema = z.object({
  videoId: z.string(),
});

export const youtubeRouter = createTRPCRouter({
  getTranscript: publicProcedure
    .input(inputSchema)
    .query(async ({ input }) => {
      try {
        return await fetchYouTubeTranscript(input.videoId);
      } catch (error) {
        console.error('Error in YouTube router:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch YouTube transcript',
        });
      }
    }),
});