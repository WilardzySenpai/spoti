'use server';

import { z } from 'zod';
import { prepareLLMToolForSpotifyTracks } from '@/ai/flows/prepare-llm-tool-for-spotify-tracks';
import type { SpotifyContent, Track, Album, Playlist, Song } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const UrlSchema = z.string().url("Please provide a valid URL.").regex(/^https:\/\/open\.spotify\.(com|com\/embed)\/(track|album|playlist)\/[a-zA-Z0-9]+/, "Please enter a valid Spotify URL (e.g., https://open.spotify.com/track/...).");

const unknownArt = PlaceHolderImages.find(p => p.id === 'album-art-default')!;

function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${(parseInt(seconds) < 10 ? '0' : '')}${seconds}`;
}

function mapSpotifyTrack(track: any): Track {
    const albumImage = track.album?.images?.[0]?.url;
    return {
        id: track.id,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        duration: formatDuration(track.duration_ms),
        albumArt: albumImage ? {
            id: track.album.id,
            imageUrl: albumImage,
            description: `Album art for ${track.album.name}`,
            imageHint: 'album art'
        } : unknownArt,
    };
}


export async function processUrl(
  prevState: SpotifyContent,
  formData: FormData
): Promise<SpotifyContent> {
  const url = formData.get('url');

  const validatedUrl = UrlSchema.safeParse(url);

  if (!validatedUrl.success) {
    return { type: 'error', message: validatedUrl.error.errors[0].message };
  }

  const spotifyUrl = validatedUrl.data;

  try {
    
    await prepareLLMToolForSpotifyTracks({ spotifyUrl });

    // In a real app, you would have a base URL from your environment
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify?url=${encodeURIComponent(spotifyUrl)}`);
    const data = await response.json();

    if (!response.ok) {
      return { type: 'error', message: data.error || 'Failed to fetch data from Spotify.' };
    }

    const type = spotifyUrl.includes('/track/') ? 'track' : spotifyUrl.includes('/album/') ? 'album' : 'playlist';

    if (type === 'track') {
        const trackData = data;
        const song: Song = {
            type: 'track',
            url: spotifyUrl,
            track: mapSpotifyTrack(trackData),
        };
        return song;
    }

    if (type === 'album') {
        const albumData = data;
        const album: Album = {
            type: 'album',
            id: albumData.id,
            name: albumData.name,
            artist: albumData.artists.map((a:any) => a.name).join(', '),
            url: spotifyUrl,
            albumArt: albumData.images?.[0] ? {
                id: albumData.id,
                imageUrl: albumData.images[0].url,
                description: `Album art for ${albumData.name}`,
                imageHint: 'album art'
            } : unknownArt,
            tracks: albumData.tracks.items.map((t:any) => mapSpotifyTrack({...t, album: { id: albumData.id, images: albumData.images, name: albumData.name}})),
        };
        return album;
    }

    if (type === 'playlist') {
        const playlistData = data;
        const playlist: Playlist = {
            type: 'playlist',
            id: playlistData.id,
            name: playlistData.name,
            creator: playlistData.owner.display_name,
            description: playlistData.description,
            url: spotifyUrl,
            tracks: playlistData.tracks.items.map((item: any) => mapSpotifyTrack(item.track)).filter(Boolean),
        };
        return playlist;
    }

    return { type: 'error', message: 'Could not identify content from URL.' };
  } catch (error) {
    console.error('Error processing Spotify URL:', error);
    return { type: 'error', message: 'An unexpected error occurred. Please try again later.' };
  }
}

export async function downloadTrackAction(trackId: string): Promise<{ success: boolean; file?: { name: string; content: string }; error?: string }> {
    // Fetch track details from Spotify API
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify?url=https://open.spotify.com/track/${trackId}`);
        const data = await response.json();
        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to fetch track details from Spotify.' };
        }
        const previewUrl = data.preview_url;
        if (!previewUrl) {
            return { success: false, error: 'No preview available for this track.' };
        }
        // Download the preview audio
        const audioRes = await fetch(previewUrl);
        if (!audioRes.ok) {
            return { success: false, error: 'Failed to download preview audio.' };
        }
        const arrayBuffer = await audioRes.arrayBuffer();
        // Convert to base64
        const base64String = Buffer.from(arrayBuffer).toString('base64');
        return {
            success: true,
            file: {
                name: `${trackId}.mp3`,
                content: `data:audio/mpeg;base64,${base64String}`
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message || 'Download failed.' };
    }
}
