import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

/**
 * Converts a video file to MP3 format using ffmpeg-static.
 *
 * @param inputPath - Path to the input video file
 * @param outputPath - Path where the MP3 file should be saved
 */
export function convertToMp3(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath || 'ffmpeg', [
      '-y',             // overwrite output if exists
      '-i', inputPath,  // input file
      '-vn',            // strip video
      '-b:a', '128k',   // audio bitrate
      '-ar', '44100',   // audio sample rate
      '-f', 'mp3',      // format
      outputPath,
    ]);

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => reject(err));
  });
}
