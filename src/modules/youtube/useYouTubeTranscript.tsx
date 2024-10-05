import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiAsync } from '~/common/util/trpc.client';

export interface YTVideoTranscript {
  title: string;
  transcript: string;
  thumbnailUrl: string;
}

export function useYouTubeTranscript(videoID: string | null, onNewTranscript: (transcript: YTVideoTranscript) => void) {
  const { data, isFetching, isError, error } = useQuery({
    enabled: !!videoID,
    queryKey: ['transcript', videoID],
    queryFn: () => apiAsync.youtube.getTranscript.query({ videoId: videoID! }),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  React.useEffect(() => {
    if (!data) return;

    const transcriptData = {
      title: data.videoTitle,
      transcript: data.transcript,
      thumbnailUrl: data.thumbnailUrl,
    };
    onNewTranscript(transcriptData);
  }, [data, onNewTranscript]);

  return {
    transcript: data ? {
      title: data.videoTitle,
      transcript: data.transcript,
      thumbnailUrl: data.thumbnailUrl,
    } : null,
    isFetching,
    isError, 
    error,
  };
}