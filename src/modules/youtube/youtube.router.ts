import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc.server';

interface YouTubeTranscriptData {
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  transcript: string;
}

// Define the input schema for the video URL
const inputSchema = z.object({
  videoUrl: z.string().url().min(1), // Ensure video URL is validated as a URL
});

// Create the YouTube router
export const youtubeRouter = createTRPCRouter({
  getTranscript: publicProcedure
    .input(inputSchema)
    .query(async ({ input }) => {
      const { videoUrl } = input;

      // Fetch the transcript using your backend API
      const transcript = await fetchTranscriptFromBackend(videoUrl); // Call your backend API

      return transcript;
    }),
});

// Function to fetch transcript from your new backend API
async function fetchTranscriptFromBackend(videoUrl: string): Promise<YouTubeTranscriptData> {
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoUrl }), // Send the video URL directly
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transcript from backend');
  }

  const data = await response.json();

  const videoId = extractVideoID(videoUrl); // Extract video ID
  if (!videoId) {
    throw new Error('Invalid video URL: Unable to extract video ID');
  }

  return {
    videoId, // This is guaranteed to be a string now
    videoTitle: data.title,               
    thumbnailUrl: data.thumbnailUrl,
    transcript: data.transcription,       
  };
}


// Helper function to extract Video ID
function extractVideoID(videoURL: string): string | null {
  const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([^#&?]*).*/;
  const match = videoURL.match(regExp);
  return (match && match[1]?.length === 11) ? match[1] : null;
}
