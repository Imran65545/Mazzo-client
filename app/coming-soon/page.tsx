"use client";

import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";

export default function ComingSoonPage() {
    return (
        <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">

            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.5)] mb-4">
                    <Rocket size={48} className="text-white fill-white/20" />
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                    Coming Soon
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 font-medium tracking-wide">
                    Stay Tuned! Something amazing is on the way.
                </p>

                <div className="mt-8">
                    <Link
                        href="/premium"
                        className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/5 backdrop-blur-md"
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </Link>
                </div>
            </div>
        </div>
    );
}
