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

  // state
  const [transcript, setTranscript] = React.useState<YTVideoTranscript | null>(null);

  // data
  const { data, isFetching, isError, error } = useQuery({
    enabled: !!videoID,
    queryKey: ['transcript', videoID],
    queryFn: async () => USE_FRONTEND_FETCH
      ? fetchYouTubeTranscript(videoID!, url => frontendSideFetch(url).then(res => res.text()))
      : apiAsync.youtube.getTranscript.query({ videoId: videoID! }),
    staleTime: Infinity,
    retry: 3,  // Add retry logic to handle occasional 429 errors
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),  // Exponential backoff for retries
  });

  // update the transcript when the underlying data changes
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
