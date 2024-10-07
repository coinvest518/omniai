// pages/api/transcribe.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { promisify } from 'util';
import FormData from 'form-data'; // Import FormData

// Promisify exec for use with async/await
const execAsync = promisify(exec);

// Function to extract audio from YouTube video
const extractAudio = async (videoUrl: string): Promise<string> => {
  const outputFilePath = path.join(process.cwd(), 'temp_audio.mp3');

  try {
    // Run youtube-dl command to extract audio
    await execAsync(`youtube-dl -x --audio-format mp3 -o "${outputFilePath}" "${videoUrl}"`);
    return outputFilePath;
  } catch (error: any) { // Provide a type annotation for 'error'
    throw new Error(`Error extracting audio: ${error.message}`);
  }
};

// Function to call Whisper API for transcription
const transcribeAudio = async (audioFilePath: string): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY; // Ensure you set this environment variable
  const url = 'https://api.whisper.ai/v1/transcriptions'; // Adjust the endpoint if necessary

  const formData = new FormData();
  formData.append('file', fs.createReadStream(audioFilePath));

  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return response.data.transcription; // Adjust this based on Whisper API's response structure
  } catch (error: any) { // Provide a type annotation for 'error'
    throw new Error(`Error during transcription: ${error.message}`);
  }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Video URL is required' });
  }

  try {
    const audioFilePath = await extractAudio(videoUrl);
    const transcription = await transcribeAudio(audioFilePath);

    // Clean up the temporary audio file after transcription
    fs.unlinkSync(audioFilePath);

    return res.status(200).json({ transcription });
  } catch (error: any) { // Provide a type annotation for 'error'
    return res.status(500).json({ error: error.message });
  }
};
