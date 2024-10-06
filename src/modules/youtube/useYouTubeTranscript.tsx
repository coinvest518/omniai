import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiAsync } from '~/common/util/trpc.client';

// Exporting the YTVideoTranscript interface
export interface YTVideoTranscript {
  title: string;
  transcript: string;
  thumbnailUrl: string;
}

// Exporting the useYouTubeTranscript function
export function useYouTubeTranscript(videoID: string | null, onNewTranscript: (transcript: YTVideoTranscript) => void) {
  const [transcript, setTranscript] = React.useState<YTVideoTranscript | null>(null);

  const { data, isFetching, isError, error } = useQuery({
    enabled: !!videoID,
    queryKey: ['transcript', videoID],
    queryFn: async () => apiAsync.youtube.getTranscript.query({ videoId: videoID! }),
    staleTime: Infinity,
  });

  React.useEffect(() => {
    if (!data) {
      return;
    }
    const transcript = {
      title: data.videoTitle,
      transcript: data.transcript,
      thumbnailUrl: data.thumbnailUrl,
    };
    setTranscript(transcript);
    onNewTranscript(transcript);
  }, [data, onNewTranscript]);

  return {
    transcript,
    isFetching,
    isError,
    error,
  };
}
