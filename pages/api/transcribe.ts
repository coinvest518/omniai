// pages/api/transcribe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoUrl } = req.body;  // Make sure you are getting videoUrl from the body
  console.log('Received video URL:', videoUrl);  // Debug log

  // Check if videoUrl is provided
  if (!videoUrl) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  const audioFilePath = path.join(os.tmpdir(), 'temp_audio.mp3');  // Use tmpdir for temporary file

  try {
    const ytdlp = spawn('yt-dlp', ['-x', '--audio-format', 'mp3', '-o', audioFilePath, videoUrl]);

    ytdlp.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Failed to transcribe video' });
      }

      // Here you would process the audio file and send back the transcription
      // For demonstration, let's assume we just send back a success message
      res.status(200).json({ transcription: 'Transcription result goes here...' });

      // Clean up temporary file if needed
      fs.unlink(audioFilePath, (err) => {
        if (err) {
          console.error('Error deleting temporary file:', err);
        }
      });
    });
    
    ytdlp.on('error', (err) => {
      console.error('Error spawning yt-dlp:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
