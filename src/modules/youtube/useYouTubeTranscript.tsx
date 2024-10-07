import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { apiAsync } from '~/common/util/trpc.client';

interface YTVideoTranscript {
  title: string;
  transcript: string;
  thumbnailUrl: string;
}

export function useYouTubeTranscript(videoID: string | null, onNewTranscript: (transcript: YTVideoTranscript) => void) {
  const [transcript, setTranscript] = React.useState<YTVideoTranscript | null>(null);
  const { data, isFetching, isError, error } = useQuery({
    enabled: !!videoID,
    queryKey: ['transcript', videoID],
    queryFn: () => apiAsync.youtube.getTranscript.query({ videoId: videoID! }),
    staleTime: Infinity,
  });

  React.useEffect(() => {
    if (data) {
      const transcript = {
        title: data.videoTitle,
        transcript: data.transcript,
        thumbnailUrl: data.thumbnailUrl,
      };
      onNewTranscript(transcript);
    }
  }, [data, onNewTranscript]);

  return { transcript, isFetching, isError, error };
}
