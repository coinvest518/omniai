import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { url, filePath } = req.body;

    if (url) {
      try {
        const response = await axios.post('https://omniai.icu/download', { url });
        return res.status(response.status).json(response.data);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to download video' });
      }
    }

    if (filePath) {
      try {
        const response = await axios.post('https://omniai.icu/transcribe', { file_path: filePath });
        return res.status(response.status).json(response.data);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to transcribe video' });
      }
    }

    return res.status(400).json({ error: 'URL or file path is required' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
