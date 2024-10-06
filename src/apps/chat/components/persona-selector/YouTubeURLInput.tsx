import * as React from 'react';
import { Box, Button, Input } from '@mui/joy';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { InlineError } from '~/common/components/InlineError';

interface YTVideoTranscript {
  title: string;
  transcript: string;
  thumbnailUrl: string;
}

interface YouTubeURLInputProps {
  onSubmit: (transcript: string) => void;
  isFetching: boolean;
  sx?: any; // Adjusted type to `any` for flexibility, change if needed
}

export const YouTubeURLInput: React.FC<YouTubeURLInputProps> = ({ onSubmit, isFetching, sx }) => {
  const [url, setUrl] = React.useState('');
  const [isFetchingTranscript, setIsFetchingTranscript] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Function to extract video ID from URL
  function extractVideoID(videoURL: string): string | null {
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^#&?]*).*/;
    const match = videoURL.match(regExp);
    return (match && match[1]?.length === 11) ? match[1] : null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form from causing a page reload
    const videoID = extractVideoID(url);
    
    if (!videoID) {
      setErrorMessage('Invalid YouTube URL');
      return;
    }

    try {
      setIsFetchingTranscript(true);
      setIsError(false);
      setErrorMessage(null);

      // Make a call to your Flask backend to download and transcribe the video
      const downloadResponse = await fetch('/api/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!downloadResponse.ok) {
        throw new Error('Failed to download video');
      }

      // Assuming the file path is returned in the response for transcription
      const downloadData = await downloadResponse.json();
      const filePath = downloadData.filePath; // Adjust this according to your response

      // Now call the transcription endpoint
      const transcriptionResponse = await fetch('/api/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_path: filePath }),
      });

      if (!transcriptionResponse.ok) {
        throw new Error('Failed to transcribe video');
      }

      const transcriptData: YTVideoTranscript = await transcriptionResponse.json();
      onSubmit(transcriptData.transcript); // Call the onSubmit handler with the transcript
    } catch (error) {
      const errorMsg = (error as Error).message || 'An unknown error occurred';
      setIsError(true);
      setErrorMessage(errorMsg);
    } finally {
      setIsFetchingTranscript(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  return (
    <Box sx={{ mb: 1, ...sx }}>
      <form onSubmit={handleSubmit}>
        <Input
          required
          type='url'
          fullWidth
          disabled={isFetching || isFetchingTranscript}
          variant='outlined'
          placeholder='Enter YouTube Video URL'
          value={url}
          onChange={handleChange}
          startDecorator={<YouTubeIcon sx={{ color: '#f00' }} />}
          sx={{ mb: 1.5, backgroundColor: 'background.popup' }}
        />
        <Button
          type='submit'
          variant='solid'
          disabled={isFetching || isFetchingTranscript || !url}
          loading={isFetching || isFetchingTranscript}
          sx={{ minWidth: 140 }}
        >
          Get Transcript
        </Button>
        {isError && <InlineError error={errorMessage} sx={{ mt: 1 }} />}
      </form>
    </Box>
  );
};
