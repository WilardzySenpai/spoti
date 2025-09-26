import { YouTube } from 'youtube-sr';

export async function searchYouTube(query: string) {
  try {
    const results = await YouTube.search(query, { limit: 1, type: 'video' });
    if (!results || results.length === 0) return null;

    const video = results[0];
    return {
      title: video.title ?? 'Unknown Title',
      url: video.url,
      videoId: video.id,
      duration: video.durationFormatted ?? '0:00',
      views: video.views ?? 0,
      author: video.channel?.name ?? 'Unknown Author',
    };
  } catch (err) {
    console.error('YouTube search failed:', err);
    return null;
  }
}

// Example usage:
// searchYouTube('Never Gonna Give You Up Rick Astley').then(console.log);
