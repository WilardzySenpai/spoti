import { NextRequest, NextResponse } from 'next/server';
import { getTrackInfo } from '@/lib/spotifyInfo';
import { searchYouTube } from '@/lib/youtubeSearch';
import { downloadYouTubeVideo } from '@/lib/youtubeDownload';
import { convertToMp3 } from '@/lib/convertToMp3';
import FormData from 'form-data';
import axios from 'axios';
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
    await downloadYouTubeVideo(video.url, tempVideoPath);

    // Step 4: Upload to CloudConvert and convert to MP3
    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing CloudConvert API key' }, { status: 500 });
    }

    // Prepare CloudConvert job
    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: {
          'import-my-file': {
            operation: 'import/upload'
          },
          'convert-my-file': {
            operation: 'convert',
            input: 'import-my-file',
            output_format: 'mp3',
            audio_codec: 'mp3',
            engine: 'ffmpeg',
          },
          'export-my-file': {
            operation: 'export/url',
            input: 'convert-my-file',
            inline: false,
            archive_multiple_files: false
          }
        }
      })
    });
    const jobData = await jobRes.json();
    const uploadTask = jobData.data.tasks.find((t: any) => t.name === 'import-my-file');
    const uploadUrl = uploadTask.result.form.url;
    const uploadParams = uploadTask.result.form.parameters;

    // Upload the video file to CloudConvert
    const formData = new FormData();
    for (const key in uploadParams) {
      formData.append(key, uploadParams[key]);
    }
    formData.append('file', fs.createReadStream(tempVideoPath));
    await axios.post(uploadUrl, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Poll for job completion
    let mp3Url = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(res => setTimeout(res, 2000));
      const pollRes = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobData.data.id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const pollData = await pollRes.json();
      const exportTask = pollData.data.tasks.find((t: any) => t.name === 'export-my-file');
      if (exportTask.status === 'finished' && exportTask.result && exportTask.result.files && exportTask.result.files.length > 0) {
        mp3Url = exportTask.result.files[0].url;
        break;
      }
    }
    fs.unlinkSync(tempVideoPath);
    if (!mp3Url) {
      return NextResponse.json({ error: 'MP3 conversion failed' }, { status: 500 });
    }
    // Return the MP3 download link
    return NextResponse.json({ mp3Url, fileName: `${track.name} - ${track.artist}.mp3` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
