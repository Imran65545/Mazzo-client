import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
export const dynamic = 'force-dynamic';
import UserActivity from "@/lib/models/UserActivity";
import { protect, AuthRequest } from "@/lib/middleware/auth";

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    console.log(`[LIKED_GET] fetching for ${req.user!.id}`);
    const songs = await UserActivity.find({
      userId: req.user!.id,
      liked: true,
    }).sort({ createdAt: -1 });
    console.log(`[LIKED_GET] Found ${songs.length} songs`);

    return NextResponse.json(songs);
  } catch (err) {
    return NextResponse.json({ message: "Failed to fetch liked songs" }, { status: 500 });
  }
}

export const GET = protect(handler);
