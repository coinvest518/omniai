// pages/api/transcribe.ts
import { NextApiRequest, NextApiResponse } from 'next'; // Import types for request and response
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoUrl }: { videoUrl: string } = req.body; // Explicitly type the request body

  if (!videoUrl) {
    return res.status(400).json({ error: 'No video URL provided' });
  }

  try {
    // Step 1: Download the audio using yt-dlp
    const audioFilePath = path.join(process.cwd(), 'temp_audio.mp3');
    const ytDlp = spawn('yt-dlp', ['-x', '--audio-format', 'mp3', '-o', audioFilePath, videoUrl]);

    ytDlp.stderr.on('data', (data: Buffer) => {
      console.error(`yt-dlp error: ${data.toString()}`);
    });

    ytDlp.on('close', async (code: number) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Error downloading audio' });
      }

      // Step 2: Transcribe the audio using Whisper or any other service
      try {
        const transcribedText = await transcribeAudio(audioFilePath);

        // Clean up the audio file
        fs.unlinkSync(audioFilePath);

        return res.status(200).json({ transcription: transcribedText });
      } catch (error) {
        console.error('Error transcribing audio:', error);
        return res.status(500).json({ error: 'Error transcribing audio' });
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Function to transcribe audio using Whisper (or any other library)
async function transcribeAudio(filePath: string): Promise<string> {
  // Assuming you have a function to call Whisper API or any other transcription API
  // This is a placeholder; implement your actual transcription logic here
  const { spawn } = require('child_process');
  const whisper = spawn('whisper', [filePath]);

  return new Promise((resolve, reject) => {
    let transcription = '';

    whisper.stdout.on('data', (data: Buffer) => {
      transcription += data.toString();
    });

    whisper.stderr.on('data', (data: Buffer) => {
      console.error(`Whisper error: ${data.toString()}`);
    });

    whisper.on('close', (code: number) => {
      if (code !== 0) {
        return reject(new Error('Error transcribing audio'));
      }
      resolve(transcription);
    });
  });
}
