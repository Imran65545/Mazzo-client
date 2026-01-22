"use client";

import { useState } from "react";
import { API_URL } from "../app/lib/api";

import { usePlayer } from "@/context/PlayerContext";
import { Lock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SearchSongs({ onSelect }: any) {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = usePlayer();

  const search = async () => {
    if (!query) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/youtube/search?q=${query}`
      );
      const data = await res.json();
      setSongs(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔒 Lock for Free Users ONLY if limit reached
  if (user && !user.isAdmin && user.plan === "free" && (Number(user.songsPlayed) || 0) >= 10) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-center bg-[#18181b] rounded-xl border border-[#27272a] p-6 space-y-4">
        <div className="bg-zinc-800 p-4 rounded-full">
          <Lock size={32} className="text-gray-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Search is Locked</h3>
          <p className="text-gray-400 text-sm mt-1">Upgrade to Premium to search and play any song.</p>
        </div>
        <Link href="/premium">
          <button className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
            Get Premium
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Search Songs</h2>
      <div className="flex flex-col md:flex-row gap-3 mb-6 md:mb-8">
        <input
          className="w-full md:flex-1 bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 md:py-4 text-gray-300 focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-500 text-base md:text-lg"
          placeholder="Search by song or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <button
          onClick={search}
          className="w-full md:w-auto px-8 py-3 md:py-4 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold rounded-lg transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.2)] md:text-lg"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="space-y-2 relative min-h-[200px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={40} className="text-green-500 animate-spin" />
              <p className="text-green-500 font-medium animate-pulse">Loading...</p>
            </div>
          </div>
        )}

        {songs.length === 0 && !isLoading ? (
          <p className="text-center text-gray-500 pt-8">
            Search for your favorite songs to get started
          </p>
        ) : (
          songs.map((song) => (
            <div
              key={song.videoId}
              onClick={() => onSelect(song)}
              className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-3 rounded-lg transition-colors"
            >
              <img src={song.thumbnail} className="w-12 h-12 rounded object-cover" />
              <div>
                <p className="text-sm font-medium text-gray-200">{song.title}</p>
                <p className="text-xs text-gray-500">{song.artist}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
