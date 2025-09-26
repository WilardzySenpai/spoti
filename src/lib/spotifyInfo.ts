import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
});

export async function getTrackInfo(trackId: string) {
  // Refresh access token
  const { body: tokenData } = await spotifyApi.refreshAccessToken();
  spotifyApi.setAccessToken(tokenData.access_token);

  // Get track info
  const { body: track } = await spotifyApi.getTrack(trackId);
  return {
    id: track.id,
    name: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    url: track.external_urls.spotify,
  };
}

// Example usage:
// getTrackInfo('3n3Ppam7vgaVa1iaRUc9Lp').then(console.log);
