// pages/api/youtube.ts

import axios, { AxiosError } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

// Define the response structure for clarity
interface DownloadResponse {
    title: string;
    thumbnailUrl: string;
    filePath: string;
}

interface TranscribeResponse {
    transcription: string;
}

// Define the possible error response structure
interface ErrorResponse {
    error: string;
    details?: string;
}
const FLASK_API_URL = 'https://omniai.icu'; // Update this to your actual domain

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse<DownloadResponse | TranscribeResponse | ErrorResponse>
) {
    if (req.method === 'POST') {
        const { url, filePath } = req.body;

        // Handle download
        if (url) {
            try {
                const response = await axios.post<DownloadResponse>(`${FLASK_API_URL}/download`, { url });
                return res.status(response.status).json(response.data);
            } catch (error) {
                const axiosError = error as AxiosError<ErrorResponse>; // Using AxiosError for type assertion
                const errorMessage = axiosError.response?.data?.error || 'Unknown error'; // Accessing error property
                return res.status(axiosError.response?.status || 500).json({
                    error: 'Failed to download video',
                    details: errorMessage,
                });
            }
        }

        // Handle transcription
        if (filePath) {
            try {
                const response = await axios.post<TranscribeResponse>(`${FLASK_API_URL}/transcribe`, { file_path: filePath });
                return res.status(response.status).json(response.data);
            } catch (error) {
                const axiosError = error as AxiosError<ErrorResponse>; // Using AxiosError for type assertion
                const errorMessage = axiosError.response?.data?.error || 'Unknown error'; // Accessing error property
                return res.status(axiosError.response?.status || 500).json({
                    error: 'Failed to transcribe video',
                    details: errorMessage,
                });
            }
        }

        return res.status(400).json({ error: 'URL or file path is required' });
    } else {
        // Handle other request methods
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
