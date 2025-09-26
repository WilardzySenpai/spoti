import ytSearch from 'yt-search';

export async function searchYouTube(query: string) {
  const result = await ytSearch(query);
  if (!result.videos.length) return null;
  // Return the top video result
  const video = result.videos[0];
  return {
    title: video.title,
    url: video.url,
    videoId: video.videoId,
    duration: video.timestamp,
    views: video.views,
    author: video.author.name,
  };
}

// Example usage:
// searchYouTube('Never Gonna Give You Up Rick Astley').then(console.log);
