import * as React from 'react';
import type { SxProps } from '@mui/joy/styles/types';
import { Box, Button, Card, IconButton, Input, Typography } from '@mui/joy';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { GoodTooltip } from '~/common/components/GoodTooltip';
import { InlineError } from '~/common/components/InlineError';

import type { SimplePersonaProvenance } from '../store-app-personas';

interface YTVideoTranscript {
  title: string;
  transcript: string;
  thumbnailUrl: string;
}

function extractVideoID(videoURL: string): string | null {
  const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^#&?]*).*/;
  const match = videoURL.match(regExp);
  return (match && match[1]?.length === 11) ? match[1] : null;
}

export function FromYouTube(props: {
  isTransforming: boolean;
  onCreate: (text: string, provenance: SimplePersonaProvenance) => void;
}) {
  const [videoURL, setVideoURL] = React.useState('');
  const [videoID, setVideoID] = React.useState<string | null>(null);
  const [transcript, setTranscript] = React.useState<YTVideoTranscript | null>(null);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { onCreate } = props;

  const fetchTranscript = async (videoId: string) => {
    try {
      setIsFetching(true);
      setIsError(false);
      setError(null);

      // Make a call to your Flask backend to download and transcribe the video
      const downloadResponse = await fetch('/api/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoURL }),
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

      const transcriptionData = await transcriptionResponse.json();
      setTranscript({ title: downloadData.title, transcript: transcriptionData.transcription, thumbnailUrl: downloadData.thumbnailUrl });

      // Call the onCreate function with the transcript
      onCreate(transcriptionData.transcription, {
        type: 'youtube',
        url: videoURL,
        title: downloadData.title,
        thumbnailUrl: downloadData.thumbnailUrl,
      });
    } catch (err) {
      const errorMessage = (err as Error).message || 'An unknown error occurred';
      setIsError(true);
      setError(errorMessage);
    } finally {
      setIsFetching(false);
    }
  };

  const handleVideoURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoURL(e.target.value);
    setVideoID(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = extractVideoID(videoURL);
    if (id) {
      setVideoID(id);
      fetchTranscript(id);
    } else {
      setVideoURL('Invalid URL');
    }
  };

  return (
    <>
      <Typography level="title-md" startDecorator={<YouTubeIcon sx={{ color: '#f00' }} />} sx={{ mb: 3 }}>
        YouTube -&gt; Persona
      </Typography>

      <form onSubmit={handleSubmit}>
        <Input
          required
          type="url"
          fullWidth
          disabled={isFetching || props.isTransforming}
          variant="outlined"
          placeholder="YouTube Video URL"
          value={videoURL}
          onChange={handleVideoURLChange}
          sx={{ mb: 1.5, backgroundColor: 'background.popup' }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="submit"
            variant="solid"
            disabled={isFetching || props.isTransforming || !videoURL}
            loading={isFetching}
            sx={{ minWidth: 140 }}
          >
            Create
          </Button>

          <GoodTooltip title="This example comes from the popular Fireship YouTube channel, which presents technical topics with irreverent humor.">
            <Button variant="outlined" color="neutral" onClick={() => setVideoURL('https://www.youtube.com/watch?v=M_wZpSEvOkc')}>
              Example
            </Button>
          </GoodTooltip>
        </Box>
      </form>

      {isError && <InlineError error={error} sx={{ mt: 3 }} />}

      {transcript && videoID && (
        <YouTubeVideoTranscriptCard transcript={transcript} onClose={() => setVideoID(null)} sx={{ mt: 3 }} />
      )}
    </>
  );
}

function YouTubeVideoTranscriptCard(props: { transcript: YTVideoTranscript, onClose: () => void, sx?: any }) {
  const { transcript } = props;
  return (
    <Card
      variant="soft"
      sx={{
        border: '1px dashed',
        borderColor: 'neutral.solidBg',
        p: 1,
        ...props.sx,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {!!transcript.thumbnailUrl && (
          <picture style={{ lineHeight: 0 }}>
            <img
              src={transcript.thumbnailUrl}
              alt="YouTube Video Thumbnail"
              height={80}
              style={{ float: 'left', marginRight: 8 }}
            />
          </picture>
        )}

        <Typography level="title-sm">
          {transcript?.title}
        </Typography>
        <Typography level="body-xs" sx={{ mt: 0.75 }}>
          {transcript?.transcript.slice(0, 280)}...
        </Typography>

        <IconButton
          size="sm"
          onClick={props.onClose}
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            borderRadius: 'md',
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Box>
    </Card>
  );
}
