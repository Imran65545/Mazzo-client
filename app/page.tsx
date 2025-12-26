"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import musicGif from "./musics.gif"; // Import local asset
import Image from "next/image";

export default function Home() {
  const { fillQueue, queue, currentSong } = usePlayer();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // 🚀 initial load
  useEffect(() => {
    if (token && queue.length === 0 && !currentSong) {
      fillQueue();
    }
  }, [token, queue.length, currentSong, fillQueue]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex flex-col items-center justify-center -mt-20">
      <div className="text-center space-y-8 animate-fade-in">

        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-9xl font-patrick-hand flex items-center justify-center gap-6 tracking-tight drop-shadow-2xl">
            Mazzo
            <div className="relative w-[120px] h-[120px]">
              <Image
                src={musicGif}
                alt="Music Vibe"
                fill
                className="object-contain"
                unoptimized // Needed for GIFs sometimes to keep animation
              />
            </div>
          </h1>
          <p className="text-gray-400 text-2xl font-light tracking-wide max-w-lg mx-auto">
            Discover the latest trending songs free on Mazzo. <br /> Your music, your vibe.
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <Link
            href="/search"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-black text-xl font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
          >
            Start Listening
            <PlayCircle size={28} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </div>
  );
}
