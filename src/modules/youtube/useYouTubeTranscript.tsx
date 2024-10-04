import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { frontendSideFetch } from '~/common/util/clientFetchers';
import { fetchYouTubeTranscript } from './youtube.fetcher';
import { apiAsync } from '~/common/util/trpc.client';

// configuration
const USE_FRONTEND_FETCH = false;

export interface YTVideoTranscript {
  title: string;
  transcript: string;
  thumbnailUrl: string;
}

export function useYouTubeTranscript(videoID: string | null, onNewTranscript: (transcript: YTVideoTranscript) => void) {
  const [transcript, setTranscript] = React.useState<YTVideoTranscript | null>(null);

  const { data, isFetching, isError, error } = useQuery({
    enabled: !!videoID,
    queryKey: ['transcript', videoID],
    queryFn: async () => {
      try {
        return USE_FRONTEND_FETCH
          ? fetchYouTubeTranscript(videoID!, url => frontendSideFetch(url).then(res => res.text()))
          : apiAsync.youtube.getTranscript.query({ videoId: videoID! });
      } catch (err) {
        console.error('Failed to fetch transcript:', err);
        throw err; // Propagate the error to the isError state
      }
    },
    staleTime: Infinity,
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
    setTranscript(transcriptData);
    onNewTranscript(transcriptData);
  }, [data, onNewTranscript]);

  return {
    transcript,
    isFetching,
    isError, 
    error,
  };
}
