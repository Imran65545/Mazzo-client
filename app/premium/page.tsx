"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { API_URL } from "../lib/api";

export default function PremiumPage() {
    const [couponCode, setCouponCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

    const handleRedeem = async () => {
        if (!couponCode.trim()) return;
        setLoading(true);
        setMessage(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setMessage({ text: "Please login to redeem.", type: "error" });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/coupons/redeem`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ code: couponCode.trim() })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ text: data.message || "Code redeemed successfully!", type: "success" });
                // Optional: Reload after a short delay to update context
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMessage({ text: data.message || "Invalid or used code.", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "Something went wrong.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-32 flex flex-col items-center">

            {/* Header */}
            <div className="text-center mt-10 mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Mazzo Premium</h1>
                <p className="text-gray-400 text-lg">Choose the plan that fits your vibe.</p>
            </div>

            {/* Plans Container */}
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center">

                {/* Lite Plan */}
                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-blue-500 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>

                    <h3 className="text-2xl font-bold mb-2">Lite</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-black">₹20</span>
                        <span className="text-gray-400">/ one-time</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3">
                            <Check size={20} className="text-blue-500" />
                            <span className="text-gray-200">Listen to 30 songs</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check size={20} className="text-blue-500" />
                            <span className="text-gray-200">Ad-free music</span>
                        </li>
                    </ul>

                    <Link href="/payment?plan=lite">
                        <button className="w-full py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform">
                            Get Lite
                        </button>
                    </Link>
                </div>

                {/* Standard Plan */}
                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-green-500 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                        POPULAR
                    </div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>

                    <h3 className="text-2xl font-bold mb-2">Standard</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-black">₹50</span>
                        <span className="text-gray-400">/ one-time</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3">
                            <Check size={20} className="text-green-500" />
                            <span className="text-gray-200">Listen to 50 songs</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check size={20} className="text-green-500" />
                            <span className="text-gray-200">High quality audio</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check size={20} className="text-green-500" />
                            <span className="text-gray-200">Ad-free music</span>
                        </li>
                    </ul>

                    <Link href="/payment?plan=standard">
                        <button className="w-full py-3 rounded-full bg-green-500 text-black font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            Get Standard
                        </button>
                    </Link>
                </div>

            </div>

            {/* 🎟️ Coupon Code Section */}
            <div className="mt-12 w-full max-w-md">
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-4">
                    <div className="text-center">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Have a coupon code?</label>
                    </div>

                    {message && (
                        <div className={`text - center text - sm mb - 2 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'} `}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter promo code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 bg-black text-white p-3 rounded-lg border border-zinc-700 outline-none focus:border-green-500 transition-colors"
                        />
                        <button
                            onClick={handleRedeem}
                            disabled={loading || !couponCode}
                            className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Apply"}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
