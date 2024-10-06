import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc.server';

interface YouTubeTranscriptData {
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  transcript: string;
}

// Define the input schema for the video ID
const inputSchema = z.object({
  videoId: z.string().min(1),
});

// Create the YouTube router
export const youtubeRouter = createTRPCRouter({
  getTranscript: publicProcedure
    .input(inputSchema)
    .query(async ({ input }) => {
      const { videoId } = input;

      // Fetch the transcript using your backend API instead
      const transcript = await fetchTranscriptFromBackend(videoId); // This function will call your new backend API

      return transcript;
    }),
});

// Function to fetch transcript from your new backend API
async function fetchTranscriptFromBackend(videoId: string): Promise<YouTubeTranscriptData> {
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoUrl: `https://www.youtube.com/watch?v=${videoId}` }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transcript from backend');
  }

  const data = await response.json();
  
  // You may need to shape the response here to match YouTubeTranscriptData
  return {
    videoId,
    videoTitle: data.title,         // Assuming the backend returns these fields
    thumbnailUrl: data.thumbnailUrl, // Ensure these keys match your backend response
    transcript: data.transcription,   // Assuming your backend response has this
  };
}
