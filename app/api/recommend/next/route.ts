import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
export const dynamic = 'force-dynamic';
import Song from "@/lib/models/Song";
import UserActivity from "@/lib/models/UserActivity";
import axios from "axios";

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
      maxResults: 15
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

    if (duration < 90 || duration > 600) continue;

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

  return songs;
}

import { protect, AuthRequest } from "@/lib/middleware/auth";

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "1");
    const userId = req.user!.id;

    const likedSongs = await UserActivity.find({ userId, liked: true })
      .sort({ createdAt: -1 })
      .limit(10);

    let query = "trending music official audio";

    if (likedSongs.length > 0) {
      const randomSeed = likedSongs[Math.floor(Math.random() * likedSongs.length)];
      const strategies = [
        `${randomSeed.artist} best songs`,
        `${randomSeed.title} ${randomSeed.artist} similar songs`,
        `${randomSeed.artist} mix`,
        `${randomSeed.genre || ""} music mix`
      ];
      query = strategies[Math.floor(Math.random() * strategies.length)];
    }

    console.log(`[RECOMMEND] generating for user based on query: "${query}"`);

    const recommendations = await fetchAndCacheSongs(query);

    if (!recommendations || recommendations.length === 0) {
      return NextResponse.json({ message: "No recommendations found" }, { status: 404 });
    }

    if (limit > 1) {
      const shuffled = recommendations.sort(() => 0.5 - Math.random());
      return NextResponse.json(shuffled.slice(0, limit));
    }

    const randomSong = recommendations[Math.floor(Math.random() * recommendations.length)];
    return NextResponse.json(randomSong);
  } catch (err: any) {
    console.error("Recommendation Error:", err.message);
    if (axios.isAxiosError(err)) {
      console.error("API Response:", err.response?.data);
    }
    return NextResponse.json({ message: "Recommendation failed" }, { status: 500 });
  }
}

export const GET = protect(handler);
