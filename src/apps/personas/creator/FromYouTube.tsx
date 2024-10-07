// FromYouTube.tsx
import * as React from 'react';
import { YouTubeURLInput } from '../../../../src/apps/chat/components/persona-selector/YouTubeURLInput'; // Adjust the path accordingly
import type { SimplePersonaProvenance } from '../store-app-personas';

interface FromYouTubeProps {
  isTransforming: boolean;
  onCreate: (text: string, provenance: SimplePersonaProvenance) => void;
}

export const FromYouTube: React.FC<FromYouTubeProps> = ({ isTransforming, onCreate }) => {
  const [isFetching, setIsFetching] = React.useState(false);

  const handleTranscriptSubmit = (transcript: string) => {
    onCreate(transcript, { type: 'text' });
  };

  return (
    <div>
      <YouTubeURLInput 
        onSubmit={handleTranscriptSubmit} 
        isFetching={isFetching} 
        sx={{ mb: 2 }} 
      />
    </div>
  );
};
