import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { apiAsync } from '~/common/util/trpc.client';

interface YTVideoTranscript {
  title: string;
  transcript: string;
  thumbnailUrl: string;
}

export function useYouTubeTranscript(videoURL: string | null, onNewTranscript: (transcript: YTVideoTranscript) => void) {
  const { data, isFetching, isError, error } = useQuery({
    enabled: !!videoURL,
    queryKey: ['transcript', videoURL],
    queryFn: () => apiAsync.youtube.getTranscript.query({ videoUrl: videoURL! }), // Pass videoURL
    staleTime: Infinity,
  });

  React.useEffect(() => {
    if (data) {
      const transcript: YTVideoTranscript = {
        title: data.videoTitle,
        transcript: data.transcript,
        thumbnailUrl: data.thumbnailUrl,
      };
      onNewTranscript(transcript);
    }
  }, [data, onNewTranscript]);

  return { transcript: data, isFetching, isError, error };
}
