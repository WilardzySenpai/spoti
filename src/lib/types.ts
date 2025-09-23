import type { ImagePlaceholder } from './placeholder-images';

export type Track = {
  id: string;
  title: string;
  artist: string;
  duration: string; // "m:ss" format
  albumArt: ImagePlaceholder;
};

export type ContentBase = {
  id: string;
  name: string;
  url: string;
  tracks: Track[];
};

export type Album = ContentBase & {
  type: 'album';
  artist: string;
  albumArt: ImagePlaceholder;
};

export type Playlist = ContentBase & {
  type: 'playlist';
  creator: string;
  description: string;
  albumArt?: ImagePlaceholder; // Playlists don't have a single album art
};

export type Song = {
  type: 'track';
  track: Track;
  url: string;
};

export type ProcessingError = {
  type: 'error';
  message: string;
};

export type InitialState = {
  type: 'initial';
};

export type SpotifyContent = Album | Playlist | Song | ProcessingError | InitialState;

export type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'error';

export type TrackDownloadState = {
  status: DownloadStatus;
  progress: number;
};