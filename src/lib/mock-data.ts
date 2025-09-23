import { PlaceHolderImages } from './placeholder-images';
import type { Album, Playlist, Song } from './types';

const albumArt1 = PlaceHolderImages.find((img) => img.id === 'album-art-1')!;
const albumArt2 = PlaceHolderImages.find((img) => img.id === 'album-art-2')!;
const albumArt3 = PlaceHolderImages.find((img) => img.id === 'album-art-3')!;
const albumArt4 = PlaceHolderImages.find((img) => img.id === 'album-art-4')!;

export const track: Song = {
  type: 'track',
  url: '',
  track: {
    id: 'track-1',
    title: 'Starlight',
    artist: 'Muse',
    duration: '4:00',
    albumArt: albumArt1,
  },
};

export const album: Album = {
  type: 'album',
  id: 'album-1',
  name: 'Black Holes and Revelations',
  artist: 'Muse',
  url: '',
  albumArt: albumArt1,
  tracks: [
    { id: 'track-1', title: 'Starlight', artist: 'Muse', duration: '4:00', albumArt: albumArt1 },
    { id: 'track-2', title: 'Supermassive Black Hole', artist: 'Muse', duration: '3:32', albumArt: albumArt1 },
    { id: 'track-3', title: 'Map of the Problematique', artist: 'Muse', duration: '4:19', albumArt: albumArt1 },
    { id: 'track-4', title: 'Knights of Cydonia', artist: 'Muse', duration: '6:07', albumArt: albumArt1 },
  ],
};

export const playlist: Playlist = {
    type: 'playlist',
    id: 'playlist-1',
    name: 'Indie Rock Classics',
    creator: 'Spotify',
    description: 'The best indie rock tracks from the 2000s and 2010s.',
    url: '',
    tracks: [
        { id: 'track-5', title: 'Last Nite', artist: 'The Strokes', duration: '3:13', albumArt: albumArt2 },
        { id: 'track-6', title: 'Mr. Brightside', artist: 'The Killers', duration: '3:43', albumArt: albumArt3 },
        { id: 'track-7', title: 'Float On', artist: 'Modest Mouse', duration: '3:28', albumArt: albumArt4 },
        { id: 'track-8', title: 'Take Me Out', artist: 'Franz Ferdinand', duration: '3:57', albumArt: albumArt2 },
        { id: 'track-9', title: 'Reptilia', artist: 'The Strokes', duration: '3:39', albumArt: albumArt2 },
        { id: 'track-10', title: 'Somebody Told Me', artist: 'The Killers', duration: '3:17', albumArt: albumArt3 },
    ]
}
