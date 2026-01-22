import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
export const dynamic = 'force-dynamic';
import Coupon from "@/lib/models/Coupon";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { code } = await req.json();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      userId = decoded.id;
    } catch (e) {
      return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return NextResponse.json({ message: "Invalid coupon code" }, { status: 404 });
    }

    if (coupon.isUsed) {
      return NextResponse.json({ message: "Coupon already used" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    user.plan = coupon.plan;
    await user.save();

    coupon.isUsed = true;
    coupon.usedBy = user._id;
    await coupon.save();

    return NextResponse.json({ success: true, message: `Redeemed ${coupon.plan} plan successfully!`, plan: user.plan });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Redemption failed" }, { status: 500 });
  }
}
