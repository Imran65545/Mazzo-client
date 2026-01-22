import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
export const dynamic = 'force-dynamic';
import UserActivity from "@/lib/models/UserActivity";
import { protect, AuthRequest } from "@/lib/middleware/auth";

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    const { videoId, title, artist, genre } = await req.json();
    const userId = req.user!.id;

    const existing = await UserActivity.findOne({ userId, videoId });

    if (existing && existing.liked) {
      existing.liked = false;
      await existing.save();
      return NextResponse.json({ liked: false });
    }

    if (existing) {
      existing.liked = true;
      await existing.save();
      return NextResponse.json({ liked: true });
    }

    console.log(`[LIKE] Creating new activity for ${videoId} - ${title}`);
    const activity = await UserActivity.create({
      userId,
      videoId,
      title,
      artist,
      genre,
      liked: true,
    });

    return NextResponse.json({ liked: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Like failed" }, { status: 500 });
  }
}

export const POST = protect(handler);
