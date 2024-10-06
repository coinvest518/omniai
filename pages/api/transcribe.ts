// pages/api/transcribe.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import ytdl from 'ytdl-core';
import axios from 'axios';
import FormData from 'form-data';

interface TranscribeRequestBody {
  videoUrl: string;
}

interface TranscribeResponse {
  transcription?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TranscribeResponse>
) {
  if (req.method === 'POST') {
    const { videoUrl }: TranscribeRequestBody = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // Extract video ID using ytdl-core
    const videoId = ytdl.getURLVideoID(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
      // Fetch the audio stream
      const audioStream = ytdl(videoUrl, { filter: (format) => format.itag === 140 }); // itag 140 for audio only (128kbps)

      // Create a FormData instance to send to OpenAI
      const form = new FormData();
      form.append('file', audioStream, { filename: `${videoId}.mp3` }); // Specify the filename
      form.append('model', 'whisper-1'); // The model you want to use
      
      // Optional: Specify the language of the audio (ISO-639-1 format)
      form.append('language', 'en'); // Replace 'en' with the appropriate language code if needed

      // Optional: Specify the response format if needed
      // form.append('response_format', 'text'); // Uncomment to get plain text response

      // Send audio to OpenAI Whisper API
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders(),
        },
      });

      // Send back the transcribed text
      res.status(200).json({ transcription: response.data.text });
    } catch (error) {
      // Enhanced error handling
      const errorMsg = (error as any).response ? (error as any).response.data : (error as any).message;
      console.error('Transcription error:', errorMsg);
      res.status(500).json({ error: 'Error fetching or transcribing audio' });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
