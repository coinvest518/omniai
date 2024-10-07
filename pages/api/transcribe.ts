import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os'; // Import os to get tmpdir
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  const audioFilePath = path.join(os.tmpdir(), 'temp_audio.mp3'); // Use temporary directory

  const ytdlp = spawn('yt-dlp', ['-x', '--audio-format', 'mp3', '-o', audioFilePath, url]);

  ytdlp.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  ytdlp.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  ytdlp.on('close', (code) => {
    if (code === 0) {
      // Read the audio file and send it back
      fs.readFile(audioFilePath, (err, audioData) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to read audio file' });
        }
        res.setHeader('Content-Type', 'audio/mp3');
        res.send(audioData);
      });
    } else {
      return res.status(500).json({ error: `yt-dlp process exited with code ${code}` });
    }
  });

  ytdlp.on('error', (error) => {
    console.error(`Failed to start subprocess: ${error}`);
    res.status(500).json({ error: 'Failed to start yt-dlp' });
  });
}
