import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
export const dynamic = 'force-dynamic';
import UserActivity from "@/lib/models/UserActivity";
import { protect, AuthRequest } from "@/lib/middleware/auth";

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    const userId = req.user!.id;

    const activity = await UserActivity.findOne({ userId, videoId });
    const isLiked = activity && activity.liked === true;

    return NextResponse.json({ liked: isLiked });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to check like status" }, { status: 500 });
  }
}

export const GET = protect(handler);
