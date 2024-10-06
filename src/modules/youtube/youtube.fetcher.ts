import axios from 'axios';

export interface YouTubeTranscriptData {
  // define your transcript data structure
}

export async function fetchYouTubeTranscript(videoId: string): Promise<YouTubeTranscriptData> {
  // Assuming you have a way to generate the file path from videoId
  const filePath = `${videoId}.mp4`; // Adjust based on your app's logic

  // Call the transcribe endpoint in your Flask app
  const response = await axios.post('/api/youtube', { filePath });
  
  return response.data.transcription; // Adjust based on your API response
}
