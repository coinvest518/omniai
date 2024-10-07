import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoUrl }: { videoUrl: string } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'No video URL provided' });
  }

  try {
    const audioFilePath = path.join(process.cwd(), 'temp_audio.mp3');
    const writeStream = fs.createWriteStream(audioFilePath);

    // Step 1: Download the audio from YouTube using ytdl-core
    const stream = ytdl(videoUrl, { filter: 'audioonly' });

    stream.pipe(writeStream);

    writeStream.on('finish', async () => {
      // Step 2: Transcribe the audio using Whisper or another service
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

    writeStream.on('error', (error) => {
      console.error('Error writing audio file:', error);
      return res.status(500).json({ error: 'Error saving audio file' });
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function transcribeAudio(filePath: string): Promise<string> {
  // Use Whisper or another transcription service here
  // This is just a placeholder implementation
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
