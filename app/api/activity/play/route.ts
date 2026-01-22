import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
export const dynamic = 'force-dynamic';
import User from "@/lib/models/User";
import { protect, AuthRequest } from "@/lib/middleware/auth";

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    const user = await User.findById(req.user!.id);
    if (user && user.plan === "free" && user.songsPlayed >= 10) {
      return NextResponse.json({ message: "Free limit reached" }, { status: 403 });
    }

    await User.findByIdAndUpdate(req.user!.id, { $inc: { songsPlayed: 1 } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to record play" }, { status: 500 });
  }
}

export const POST = protect(handler);
