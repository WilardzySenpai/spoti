import ytdl from 'ytdl-core';
import fs from 'fs';

export async function downloadYouTubeVideo(videoUrl: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = ytdl(videoUrl, { quality: 'highestaudio' });
    stream.pipe(fs.createWriteStream(outputPath));
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

// Example usage:
// await downloadYouTubeVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ', './output.mp4');
