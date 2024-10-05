import { google } from 'googleapis';


interface YouTubeTranscriptData {
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  transcript: string;
}

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY // Make sure to set this in your environment variables
});

export async function fetchYouTubeTranscript(videoId: string): Promise<YouTubeTranscriptData> {
  try {
    // Fetch video details
    const videoResponse = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId]
    });

    const videoDetails = videoResponse.data.items?.[0]?.snippet;
    if (!videoDetails) {
      throw new Error('Video details not found');
    }

    // Fetch captions
    const captionsResponse = await youtube.captions.list({
      part: ['snippet'],
      videoId: videoId
    });

    const captionTrack = captionsResponse.data.items?.find(item => item.snippet?.language === 'en');
    if (!captionTrack) {
      throw new Error('English captions not found');
    }

    // Download the actual transcript
    const transcriptResponse = await youtube.captions.download({
      id: captionTrack.id!,
      tfmt: 'srt' // SubRip format
    });

    const transcript = transcriptResponse.data as string;

    return {
      videoId,
      videoTitle: videoDetails.title || '',
      thumbnailUrl: videoDetails.thumbnails?.high?.url || '',
      transcript: parseSrtToPlainText(transcript), // You'll need to implement this function
    };
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    throw error;
  }
}

function parseSrtToPlainText(srtTranscript: string): string {
  // Implement SRT parsing logic here
  // Remove timecodes and convert to plain text
  // This is a simple example and might need to be more robust
  return srtTranscript
    .split('\n')
    .filter(line => !line.match(/^\d+$/) && !line.match(/^\d{2}:\d{2}:\d{2},\d{3}/))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}