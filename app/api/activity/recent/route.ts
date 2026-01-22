import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
export const dynamic = 'force-dynamic';
import UserActivity from "@/lib/models/UserActivity";
import { protect, AuthRequest } from "@/lib/middleware/auth";

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    const songs = await UserActivity.find({
      userId: req.user!.id,
    })
      .sort({ timestamp: -1 })
      .limit(20);

    return NextResponse.json(songs);
  } catch (err) {
    return NextResponse.json({ message: "Failed to fetch recent songs" }, { status: 500 });
  }
}

export const GET = protect(handler);
