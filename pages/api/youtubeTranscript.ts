import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';

interface YouTubeTranscriptData {
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  transcript: string;
}

// Initialize the YouTube API client
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY, // Make sure to set this in your environment variables
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid videoId parameter' });
  }

  try {
    const transcriptData = await fetchYouTubeTranscript(videoId);
    res.status(200).json(transcriptData);
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube transcript' });
  }
}

// Function to fetch YouTube transcript
async function fetchYouTubeTranscript(videoId: string): Promise<YouTubeTranscriptData> {
  try {
    const videoResponse = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId]
    });

    const videoDetails = videoResponse.data.items?.[0]?.snippet;
    if (!videoDetails) {
      throw new Error('Video details not found');
    }

    const captionsResponse = await youtube.captions.list({
      part: ['snippet'],
      videoId
    });

    const captionTrack = captionsResponse.data.items?.find(item => item.snippet?.language === 'en');
    if (!captionTrack) {
      throw new Error('English captions not found');
    }

    const transcriptResponse = await youtube.captions.download({
      id: captionTrack.id!,
      tfmt: 'srt' // SubRip format
    });

    const transcript = transcriptResponse.data as string;

    return {
      videoId,
      videoTitle: videoDetails.title || '',
      thumbnailUrl: videoDetails.thumbnails?.high?.url || '',
      transcript: parseSrtToPlainText(transcript),
    };
  } catch (error) {
    throw error;
  }
}

function parseSrtToPlainText(srtTranscript: string): string {
  return srtTranscript
    .split('\n')
    .filter(line => !line.match(/^\d+$/) && !line.match(/^\d{2}:\d{2}:\d{2},\d{3}/))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
