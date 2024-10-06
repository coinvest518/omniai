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
  // Existing logic can be commented out or deleted
  return {
    transcript: null,
    isFetching: false,
    isError: false,
    error: null,
  };
}