import {NextResponse} from 'next/server';

async function getAccessToken() {
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!refresh_token || !client_id || !client_secret) {
    throw new Error('Missing Spotify environment variables');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to fetch access token');
  }
  return data.access_token;
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({error: 'URL is required'}, {status: 400});
  }

  try {
    const accessToken = await getAccessToken();
    const urlParts = url.split('/');
    const type = urlParts[urlParts.length - 2];
    const id = urlParts[urlParts.length - 1].split('?')[0];

    if (!['track', 'album', 'playlist'].includes(type) || !id) {
      return NextResponse.json({error: 'Invalid Spotify URL'}, {status: 400});
    }

    const spotifyApiUrl = `https://api.spotify.com/v1/${type}s/${id}`;

    const spotifyResponse = await fetch(spotifyApiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!spotifyResponse.ok) {
      const errorData = await spotifyResponse.json();
      console.error('Spotify API Error:', errorData);
      return NextResponse.json(
        {error: `Failed to fetch from Spotify: ${errorData.error.message}`},
        {status: spotifyResponse.status}
      );
    }

    const data = await spotifyResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Server-side error:', error);
    return NextResponse.json(
      {error: error.message || 'An internal server error occurred'},
      {status: 500}
    );
  }
}