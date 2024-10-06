import type { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';

interface YouTubeTranscriptData {
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  transcript: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid videoId parameter' });
  }

  try {
    const transcriptData = await fetchYouTubeTranscript(videoId);
    res.status(200).json(transcriptData);
  } catch (error: any) {
    console.error('Error fetching YouTube data:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch YouTube transcript', details: error.message || error });
  }
}

async function fetchYouTubeTranscript(videoId: string): Promise<YouTubeTranscriptData> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const transcriptText = transcript.map(entry => entry.text).join(' ');

    // Fetch video details using the oEmbed API (doesn't require API key)
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oEmbedResponse = await fetch(oEmbedUrl);
    const oEmbedData = await oEmbedResponse.json();

    return {
      videoId,
      videoTitle: oEmbedData.title || '',
      thumbnailUrl: oEmbedData.thumbnail_url || '',
      transcript: transcriptText,
    };
  } catch (error) {
    throw error
  }
}