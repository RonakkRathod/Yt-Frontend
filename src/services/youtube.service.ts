const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  viewCount?: string;
}

// YouTube API response types
interface YouTubeAPIVideoItem {
  id: string;
  snippet: {
    title: string;
    thumbnails: { medium: { url: string } };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
  };
  statistics: {
    viewCount: string;
  };
}

interface YouTubeAPISearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { medium: { url: string } };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
  };
}

async function fetchFromYouTube(endpoint: string, params: Record<string, string | number>) {
  if (!API_KEY) throw new Error("YouTube API key not found");

  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries({ ...params, key: API_KEY }).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`YouTube API error: ${response.statusText}`);
  return response.json();
}

export async function getPopularVideos(maxResults = 20): Promise<YouTubeVideo[]> {
  const data = await fetchFromYouTube("videos", {
    part: "snippet,statistics",
    chart: "mostPopular",
    regionCode: "IN",
    maxResults,
  });

  return data.items.map((item: YouTubeAPIVideoItem) => ({
    id: item.id,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt,
    viewCount: item.statistics.viewCount,
  }));
}

export async function searchVideos(query: string, maxResults = 20): Promise<YouTubeVideo[]> {
  const data = await fetchFromYouTube("search", {
    part: "snippet",
    q: query,
    type: "video",
    maxResults,
  });

  return data.items.map((item: YouTubeAPISearchItem) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt,
  }));
}
