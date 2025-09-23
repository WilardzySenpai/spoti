'use client';

import { useActionState, useEffect } from 'react';
import { Music, AlertCircle, Sparkles } from 'lucide-react';
import { processUrl } from '@/app/actions';
import type { SpotifyContent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UrlForm } from './UrlForm';
import { TrackList } from './TrackList';

const initialState: SpotifyContent = {
  type: 'initial',
};

export default function SpotDownApp() {
  const [state, formAction] = useActionState(processUrl, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.type === 'error') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="w-full max-w-4xl space-y-8">
      <header className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4">
          <Music className="h-12 w-12 text-primary" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            SpotDown
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Paste a Spotify URL below to get started. You can use a song, album, or playlist link.
        </p>
      </header>

      <UrlForm formAction={formAction} />

      {state.type === 'album' || state.type === 'playlist' || state.type === 'track' ? (
        <TrackList content={state} key={state.url} />
      ) : state.type === 'initial' ? (
        <Alert className="border-dashed">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Waiting for a link!</AlertTitle>
            <AlertDescription>
                Paste a Spotify link above and click "Get Tracks" to see the magic happen.
            </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
