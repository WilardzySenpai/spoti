import { NextRequest, NextResponse } from 'next/server';
import { getTrackInfo } from '@/lib/spotifyInfo';
import { searchYouTube } from '@/lib/youtubeSearch';
import { downloadYouTubeVideo } from '@/lib/youtubeDownload';
import { convertToMp3 } from '@/lib/convertToMp3';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  const { spotifyTrackId } = await req.json();
  if (!spotifyTrackId) {
    return NextResponse.json({ error: 'Missing spotifyTrackId' }, { status: 400 });
  }

  try {
    // Step 1: Get Spotify info
    const track = await getTrackInfo(spotifyTrackId);
    const searchQuery = `${track.name} ${track.artist}`;

    // Step 2: Search YouTube
    const video = await searchYouTube(searchQuery);
    if (!video) {
      return NextResponse.json({ error: 'No YouTube video found' }, { status: 404 });
    }

    // Step 3: Download YouTube video
    const tempVideoPath = path.join('/tmp', `${track.id}.mp4`);
    const outputMp3Path = path.join('/tmp', `${track.id}.mp3`);
    await downloadYouTubeVideo(video.url, tempVideoPath);

    // Step 4: Convert to MP3
    await convertToMp3(tempVideoPath, outputMp3Path);

    // Step 5: Send MP3 file
    const mp3Buffer = fs.readFileSync(outputMp3Path);
    fs.unlinkSync(tempVideoPath);
    fs.unlinkSync(outputMp3Path);
    return new NextResponse(new Uint8Array(mp3Buffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename=\"${track.name} - ${track.artist}.mp3\"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
