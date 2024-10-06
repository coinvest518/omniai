import * as React from 'react';
import { Box, Button, Card, IconButton, Input, Typography } from '@mui/joy';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { InlineError } from '~/common/components/InlineError';
import type { SimplePersonaProvenance } from '../store-app-personas';

// Function to extract video ID from the YouTube URL
function extractVideoID(videoURL: string): string | null {
  const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^#&?]*).*/;
  const match = videoURL.match(regExp);
  return (match && match[1]?.length === 11) ? match[1] : null; // Correctly access match[1]
}

function YouTubeVideoTranscriptCard(props: { transcript: string; onClose: () => void; sx?: React.CSSProperties; }) {
  const { transcript, onClose } = props;
  return (
    <Card
      variant='soft'
      sx={{
        border: '1px dashed',
        borderColor: 'neutral.solidBg',
        p: 1,
        ...props.sx,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography level="body-md">Transcription</Typography> {/* Changed title to "Transcription" */}
        <IconButton onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>
      <Typography>{transcript}</Typography>
    </Card>
  );
}

export function FromYouTube(props: { isTransforming: boolean; onCreate: (text: string, provenance: SimplePersonaProvenance) => void; }) {
  const [videoURL, setVideoURL] = React.useState('');
  const [transcription, setTranscription] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { onCreate } = props;

  const handleVideoURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoURL(e.target.value);
    setTranscription(null); // Reset transcription on new URL
    setError(null); // Reset error on new URL
  };

  const handleCreateFromTranscript = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoID(videoURL) || null;
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }

    try {
      // Call your backend API to get the transcription
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: videoURL }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transcription');
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTranscription(data.transcription);
        onCreate(data.transcription, {
          type: 'youtube',
          url: videoURL,
          title: 'YouTube Video', // You can customize this if needed
          thumbnailUrl: '', // Add thumbnail URL if available
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <Box>
      <form onSubmit={handleCreateFromTranscript}>
        <Input
          placeholder="Enter YouTube video URL"
          value={videoURL}
          onChange={handleVideoURLChange}
          endDecorator={
            <Button type="submit" disabled={!videoURL}>
              Fetch Transcript
            </Button>
          }
        />
      </form>
      {error && <InlineError error={error} />} {/* Show error message */}
      {transcription && <YouTubeVideoTranscriptCard transcript={transcription} onClose={() => setTranscription(null)} />}
      {props.isTransforming && <Typography>Transforming...</Typography>}
    </Box>
  );
}
