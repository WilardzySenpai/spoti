import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath || 'ffmpeg');

export function convertToMp3(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioBitrate(128)
      .format('mp3')
      .on('end', () => resolve())
      .on('error', reject)
      .save(outputPath);
  });
}

// Example usage:
// await convertToMp3('./output.mp4', './output.mp3');
