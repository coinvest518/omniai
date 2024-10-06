import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';
import axios from 'axios';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust this value based on your needs
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoUrl } = body;

    // Validate videoUrl
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    // Extract video ID using ytdl-core
    let videoId: string;
    try {
      videoId = ytdl.getURLVideoID(videoUrl);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
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
    return NextResponse.json({ transcription: response.data.text });
  } catch (error) {
    console.error('Transcription error:', error);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json({ error: `OpenAI API error: ${error.response.data.error.message}` }, { status: error.response.status });
    } else if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  }
}