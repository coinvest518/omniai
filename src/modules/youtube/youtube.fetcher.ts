import { z } from 'zod';

const youtubeTranscriptionSchema = z.object({
  wireMagic: z.literal('pb3'),
  events: z.array(
    z.object({
      tStartMs: z.number(),
      dDurationMs: z.number().optional(),
      aAppend: z.number().optional(),
      segs: z.array(
        z.object({
          utf8: z.string(),
          tOffsetMs: z.number().optional(),
        }),
      ).optional(),
    }),
  ),
});

function extractFromTo(html: string, from: string, to: string, label: string): string {
  const indexStart = html.indexOf(from);
  const indexEnd = html.indexOf(to, indexStart);
  if (indexStart < 0 || indexEnd <= indexStart)
    throw new Error(`[YouTube API Issue] Could not find '${label}'`);
  return html.substring(indexStart, indexEnd);
}


interface YouTubeTranscriptData {
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  transcript: string;
}

export async function fetchYouTubeTranscript(videoId: string, fetchTextFn: (url: string) => Promise<string>): Promise<YouTubeTranscriptData> {
  throw new Error('This function is deprecated. Use the API endpoint instead.');
}