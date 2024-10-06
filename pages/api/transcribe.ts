import type { NextApiRequest, NextApiResponse } from 'next';
import ytdl from 'ytdl-core';
import axios from 'axios';
import FormData from 'form-data';

interface TranscribeResponse {
  transcription?: string;
  error?: string;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust this value based on your needs
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TranscribeResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { videoUrl } = req.body;

    // Validate videoUrl
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // Extract video ID using ytdl-core
    let videoId: string;
    try {
      videoId = ytdl.getURLVideoID(videoUrl);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Fetch the audio stream
    const audioStream = ytdl(videoUrl, { filter: 'audioonly', quality: 'lowestaudio' });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Create a FormData instance to send to OpenAI
    const form = new FormData();
    form.append('file', buffer, { filename: `${videoId}.mp3` });
    form.append('model', 'whisper-1');
    form.append('language', 'en');

    // Send audio to OpenAI Whisper API
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
    });

    // Send back the transcribed text
    return res.status(200).json({ transcription: response.data.text });
  } catch (error) {
    console.error('Transcription error:', error);
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({ error: `OpenAI API error: ${error.response.data.error.message}` });
    } else if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
}