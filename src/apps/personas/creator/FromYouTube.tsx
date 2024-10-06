import * as React from 'react';
import { Box, Button, Card, IconButton, Input, Typography } from '@mui/joy';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useYouTubeTranscript, YTVideoTranscript } from '~/modules/youtube/useYouTubeTranscript';
import { InlineError } from '~/common/components/InlineError';
import type { SimplePersonaProvenance } from '../store-app-personas';

// Function to extract video ID from the YouTube URL
function extractVideoID(videoURL: string): string | null {
  const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^#&?]*).*/;
  const match = videoURL.match(regExp);
  return (match && match[1]?.length === 11) ? match[1] : null; // Correctly access match[1]
}


function YouTubeVideoTranscriptCard(props: { transcript: YTVideoTranscript; onClose: () => void; sx?: React.CSSProperties; }) {
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
        <Typography level="body-md">{transcript.title}</Typography> {/* Changed to body-md */}
        <IconButton onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>
      <Typography>{transcript.transcript}</Typography>
    </Card>
  );
}

export function FromYouTube(props: { isTransforming: boolean; onCreate: (text: string, provenance: SimplePersonaProvenance) => void; }) {
  const [videoURL, setVideoURL] = React.useState('');
  const [videoID, setVideoID] = React.useState<string | null>(null);
  const { onCreate } = props;

  const onNewTranscript = React.useCallback((transcript: YTVideoTranscript) => {
    onCreate(
      transcript.transcript,
      {
        type: 'youtube',
        url: videoURL,
        title: transcript.title,
        thumbnailUrl: transcript.thumbnailUrl,
      },
    );
  }, [onCreate, videoURL]);

  const { transcript, isFetching, isError, error } = useYouTubeTranscript(videoID, onNewTranscript);

  const handleVideoURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoID(null);
    setVideoURL(e.target.value);
  };

  const handleCreateFromTranscript = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoID(videoURL) || null;
    if (!videoId) {
      setVideoURL('Invalid');
      return;
    }
    setVideoID(videoId);
  };

  return (
    <Box>
      <form onSubmit={handleCreateFromTranscript}>
        <Input
          placeholder="Enter YouTube video URL"
          value={videoURL}
          onChange={handleVideoURLChange}
          endDecorator={
            <Button type="submit" disabled={isFetching}>
              {isFetching ? 'Loading...' : 'Fetch Transcript'}
            </Button>
          }
        />
      </form>
      {isError && <InlineError error={error} />} {/* Pass error directly */}
      {transcript && <YouTubeVideoTranscriptCard transcript={transcript} onClose={() => setVideoID(null)} />}
      {props.isTransforming && <Typography>Transforming...</Typography>}
    </Box>
  );
}
