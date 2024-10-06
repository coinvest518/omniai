import * as React from 'react';
import { Box, Button, Input } from '@mui/joy';
import YouTubeIcon from '@mui/icons-material/YouTube';
import type { SxProps } from '@mui/joy/styles/types';

interface YouTubeURLInputProps {
  onSubmit: (transcript: string) => void; // Passes the transcript text to parent component
  isFetching: boolean;
  sx?: SxProps;
}

export const YouTubeURLInput: React.FC<YouTubeURLInputProps> = ({ onSubmit, isFetching, sx }) => {
  const [url, setUrl] = React.useState('');
  const [submitFlag, setSubmitFlag] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Function to extract video ID from URL
  function extractVideoID(videoURL: string): string | null {
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^#&?]*).*/;
    const match = videoURL.match(regExp);
    return (match && match[1]?.length === 11) ? match[1] : null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form from causing a page reload
    setSubmitFlag(true); // Set flag to indicate a submit action
    const videoId = extractVideoID(url);
    
    if (!videoId) {
      setError('Invalid YouTube URL');
      setSubmitFlag(false);
      return;
    }

    try {
      // Call your backend API to get the transcription
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transcription');
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        onSubmit(data.transcription);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSubmitFlag(false); // Reset submit flag after handling
    }
  };

  return (
    <Box sx={{ mb: 1, ...sx }}>
      <form onSubmit={handleSubmit}>
        <Input
          required
          type='url'
          fullWidth
          disabled={isFetching || submitFlag}
          variant='outlined'
          placeholder='Enter YouTube Video URL'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          startDecorator={<YouTubeIcon sx={{ color: '#f00' }} />}
          sx={{ mb: 1.5, backgroundColor: 'background.popup' }}
        />
        <Button
          type='submit'
          variant='solid'
          disabled={isFetching || submitFlag || !url}
          loading={isFetching || submitFlag}
          sx={{ minWidth: 140 }}
        >
          Get Transcript
        </Button>
        {error && <div>Error: {error}</div>} {/* Show error message */}
      </form>
    </Box>
  );
};
