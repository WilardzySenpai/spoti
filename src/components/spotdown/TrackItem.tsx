'use client';

import Image from 'next/image';
import { memo } from 'react';
import { Download, CheckCircle2, Loader2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Track, DownloadStatus } from '@/lib/types';

type TrackItemProps = {
  track: Track;
  status: DownloadStatus;
  progress: number;
  onDownload: () => void;
};

function DownloadButton({ status, onDownload }: { status: DownloadStatus; onDownload: () => void }) {
  const isActionable = status === 'idle' || status === 'error';
  
  const iconMap = {
    idle: <Download />,
    downloading: <Loader2 className="animate-spin" />,
    completed: <CheckCircle2 className="text-primary" />,
    error: <RefreshCw />,
  };

  const textMap = {
    idle: 'Download',
    downloading: 'Downloading',
    completed: 'Completed',
    error: 'Retry'
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onDownload} 
      disabled={!isActionable} 
      aria-label={textMap[status]}
      className={cn(
          "w-24 gap-2", 
          status === 'completed' && "text-primary",
          status === 'error' && "text-destructive"
        )}
    >
      {iconMap[status]}
      <span className="hidden sm:inline">{textMap[status]}</span>
    </Button>
  );
}

export const TrackItem = memo(function TrackItem({
  track,
  status,
  progress,
  onDownload,
}: TrackItemProps) {
  return (
    <div className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
      <Image
        src={track.albumArt.imageUrl}
        alt={`Album art for ${track.title}`}
        width={48}
        height={48}
        className="rounded-md aspect-square object-cover"
        data-ai-hint={track.albumArt.imageHint}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{track.title}</p>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
      </div>
      <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm">
        <Clock className="w-4 h-4" />
        {track.duration}
      </div>
      <div className="flex items-center gap-4 w-32 justify-end">
        {status === 'downloading' ? (
          <div className="w-24 flex items-center">
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <DownloadButton status={status} onDownload={onDownload} />
        )}
      </div>
    </div>
  );
});