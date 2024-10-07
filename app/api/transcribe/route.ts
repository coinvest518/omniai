import { NextResponse } from 'next/server';
import ytdl from 'ytdl-core';
import axios from 'axios';
import { Readable } from 'stream';
import FormData from 'form-data';

interface TranscribeRequestBody {
  videoUrl: string;
}

// Helper function to convert stream to buffer
function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      reject(err);
    });
  });
}

// POST route handler for transcription
export async function POST(req: Request) {
  try {
    const { videoUrl }: TranscribeRequestBody = await req.json();

    // Validate videoUrl
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    // Validate and extract video ID from YouTube URL
    let videoId: string;
    try {
      videoId = ytdl.getURLVideoID(videoUrl);
    } catch (error) {
      console.error('Invalid YouTube URL:', error);
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Fetch the audio stream from YouTube
    let audioStream;
    try {
      audioStream = ytdl(videoUrl, { filter: 'audioonly', quality: 'lowestaudio' });
    } catch (error) {
      console.error('Error fetching audio stream from YouTube:', error);
      return NextResponse.json({ error: 'Failed to fetch audio from YouTube' }, { status: 500 });
    }

    // Convert audio stream to buffer
    const audioBuffer = await streamToBuffer(audioStream);

    // Prepare the form data for Whisper API
    const form = new FormData();
    form.append('file', audioBuffer, `${videoId}.mp3`); // Attach audio buffer as file
    form.append('model', 'whisper-1');
    form.append('language', 'en');

    // Send the request to OpenAI Whisper API
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Use your OpenAI API key
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity, // Handle large audio files
    });

    // Return the transcription response
    return NextResponse.json({ transcription: response.data.text }, { status: 200 });

  } catch (error) {
    console.error('Transcription error:', error);

    // Handle Axios-specific errors
    if (axios.isAxiosError(error) && error.response) {
      console.error('OpenAI API Error:', error.response.data);
      return NextResponse.json({ error: `OpenAI API error: ${error.response.data.error.message}` }, { status: error.response.status });
    }

    // Handle unexpected errors
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
