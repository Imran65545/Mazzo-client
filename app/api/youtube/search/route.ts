import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import connectDB from "@/lib/db";
import Song from "@/lib/models/Song";
import axios from "axios";
import NodeCache from "node-cache";

const myCache = new NodeCache({ stdTTL: 3600 });
const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YT_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos";

function convertDuration(duration: string): number {
  const match = duration.match(/PT(\d+M)?(\d+S)?/);
  const minutes = match?.[1] ? parseInt(match[1]) : 0;
  const seconds = match?.[2] ? parseInt(match[2]) : 0;
  return minutes * 60 + seconds;
}

async function fetchAndCacheSongs(query: string) {
  const searchResponse = await axios.get(YT_SEARCH_URL, {
    params: {
      key: process.env.YOUTUBE_API_KEY,
      q: `${query} official audio`,
      part: "snippet",
      type: "video",
      videoCategoryId: "10",
      maxResults: 50
    },
  });

  const videoIds = searchResponse.data.items
    .map((item: any) => item.id.videoId)
    .join(",");

  if (!videoIds) return [];

  const videoResponse = await axios.get(YT_VIDEO_URL, {
    params: {
      key: process.env.YOUTUBE_API_KEY,
      part: "contentDetails,snippet",
      id: videoIds,
    },
  });

  const songs = [];

  for (const video of videoResponse.data.items) {
    const videoId = video.id;
    const duration = convertDuration(video.contentDetails.duration);

    if (duration < 60 || duration > 1200) continue;

    let song = await Song.findOne({ videoId });

    if (!song) {
      song = await Song.create({
        videoId,
        title: video.snippet.title,
        artist: video.snippet.channelTitle,
        thumbnail: video.snippet.thumbnails.medium.url,
        duration,
      });
    }

    songs.push(song);
  }

  return songs.slice(0, 20);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json({ message: "Query is required" }, { status: 400 });
    }

    const cachedSongs = myCache.get(q);
    if (cachedSongs) {
      console.log(`[CACHE HIT] Serving ${q} from cache`);
      return NextResponse.json(cachedSongs);
    }

    const songs = await fetchAndCacheSongs(q);
    myCache.set(q, songs);

    return NextResponse.json(songs);
  } catch (error: any) {
    console.error("YouTube search error:", error.message);
    if (axios.isAxiosError(error)) {
      console.error("API Response:", error.response?.data);
    }
    return NextResponse.json({ message: "YouTube search failed" }, { status: 500 });
  }
}
