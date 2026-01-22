import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
export const dynamic = 'force-dynamic';
import Payment from "@/lib/models/Payment";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { utr, amount, plan } = await req.json();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      userId = decoded.id;
    } catch (e) {
      return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    if (!utr || !amount || !plan) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const existingPayment = await Payment.findOne({ utr });
    if (existingPayment) {
      return NextResponse.json({ message: "UTR already used" }, { status: 400 });
    }

    if (utr.length < 10 || utr.length > 22) {
      return NextResponse.json({ message: "Invalid UTR format" }, { status: 400 });
    }

    const payment = await Payment.create({
      userId,
      utr,
      amount,
      plan,
      status: "verified"
    });

    const user = await User.findById(userId);
    if (user) {
      user.plan = plan;
      await user.save();
    }

    return NextResponse.json({ success: true, message: "Payment Verified! Plan Unlocked." });
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      return NextResponse.json({ message: "UTR already used" }, { status: 400 });
    }
    return NextResponse.json({ message: "Verification failed" }, { status: 500 });
  }
}
