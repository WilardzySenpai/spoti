'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Album, ListMusic, Download, Users, Music } from 'lucide-react';
import { downloadTrackAction } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SpotifyContent, Track, TrackDownloadState } from '@/lib/types';
import { TrackItem } from './TrackItem';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

type TrackStates = Record<string, TrackDownloadState>;

function initializeTrackStates(tracks: Track[]): TrackStates {
  return tracks.reduce((acc, track) => {
    acc[track.id] = { status: 'idle', progress: 0 };
    return acc;
  }, {} as TrackStates);
}

const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

const base64ToBlob = (base64: string, type: string) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
}

export function TrackList({ content }: { content: SpotifyContent }) {
  if (content.type === 'error' || content.type === 'initial') return null;

  const tracks = content.type === 'track' ? [content.track] : content.tracks;
  const [trackStates, setTrackStates] = useState<TrackStates>(() => initializeTrackStates(tracks));
  
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = useCallback(async (track: Track) => {
    if (trackStates[track.id]?.status !== 'idle') return;

    setTrackStates((prev) => ({
      ...prev,
      [track.id]: { status: 'downloading', progress: 50 },
    }));

    try {
        const result = await downloadTrackAction(track.id);
        if (result.success && result.file) {
            const blob = base64ToBlob(result.file.content, 'audio/mpeg');
            downloadFile(blob, `${track.artist} - ${track.title}.mp3`);
            setTrackStates((prev) => ({
                ...prev,
                [track.id]: { status: 'completed', progress: 100 },
            }));
        } else {
            throw new Error(result.error || 'Download failed.');
        }
    } catch (error: any) {
        setTrackStates((prev) => ({
            ...prev,
            [track.id]: { status: 'error', progress: 0 },
        }));
        toast({
            variant: 'destructive',
            title: 'Download Error',
            description: `Could not download "${track.title}". ${error.message}`,
        });
    }
  }, [trackStates, toast]);

  const handleBulkDownload = async () => {
    setIsBulkDownloading(true);
    for (const track of tracks) {
        if (trackStates[track.id].status === 'idle') {
            await handleDownload(track);
            await new Promise(resolve => setTimeout(resolve, 300)); // Stagger downloads
        }
    }
    // Note: isBulkDownloading is not set back to false to keep button disabled.
  };

  const downloadedCount = Object.values(trackStates).filter(t => t.status === 'completed').length;
  const totalProgress = (downloadedCount / tracks.length) * 100;
  const allCompleted = downloadedCount === tracks.length;

  const getHeaderIcon = () => {
    switch (content.type) {
        case 'album': return <Album className="w-6 h-6 text-muted-foreground" />;
        case 'playlist': return <ListMusic className="w-6 h-6 text-muted-foreground" />;
        default: return <Music className="w-6 h-6 text-muted-foreground" />;
    }
  }

  return (
    <Card className="w-full overflow-hidden shadow-lg">
      <CardHeader className="flex flex-col md:flex-row md:items-start gap-4 bg-card/50">
        {content.type !== 'track' && content.albumArt && (
            <Image
                src={content.albumArt.imageUrl}
                alt={content.name}
                width={128}
                height={128}
                className="rounded-lg aspect-square object-cover"
                data-ai-hint={content.albumArt.imageHint}
            />
        )}
         {content.type === 'playlist' && !content.albumArt && (
             <div className="w-[128px] h-[128px] bg-muted rounded-lg flex items-center justify-center">
                <ListMusic className="w-16 h-16 text-muted-foreground" />
            </div>
         )}

        <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              {getHeaderIcon()}
              <CardTitle className="text-2xl md:text-3xl font-bold">{content.type === 'track' ? content.track.title : content.name}</CardTitle>
            </div>
            {content.type === 'album' && <CardDescription className="flex items-center gap-2"><Users className="w-4 h-4"/>{content.artist}</CardDescription>}
            {content.type === 'playlist' && <CardDescription className="flex items-center gap-2"><Users className="w-4 h-4"/>By {content.creator}</CardDescription>}
            {content.type === 'track' && <CardDescription className="flex items-center gap-2"><Users className="w-4 h-4"/>{content.track.artist}</CardDescription>}

            {tracks.length > 1 && (
                <div className="pt-2">
                    <Button onClick={handleBulkDownload} disabled={isBulkDownloading || allCompleted} className="font-semibold" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        {allCompleted ? "All Downloaded" : "Download All"}
                    </Button>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {tracks.length > 1 && (
            <div className="px-6 py-4 space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Overall Progress</span>
                    <span>{downloadedCount} / {tracks.length} tracks</span>
                </div>
                <Progress value={totalProgress} />
            </div>
        )}
        <Separator />
        <div className="divide-y divide-border">
          {tracks.map((track) => (
            <TrackItem
              key={track.id}
              track={track}
              status={trackStates[track.id]?.status ?? 'idle'}
              progress={trackStates[track.id]?.progress ?? 0}
              onDownload={() => handleDownload(track)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}