"use client";

import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { Play, Music, Lock } from "lucide-react";
import Link from "next/link";
import YouTubePlayer from "@/components/YouTubePlayer";

export default function MusicPlayerPage() {
  const { currentSong, queue, playSong, user, isPlaying, togglePlay } = usePlayer();
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekTo, setSeekTo] = useState<number | null>(null);

  // 🔒 Lock for Free Users
  if (user && !user.isAdmin && user.plan === "free") {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-black text-white p-6 text-center space-y-6">
        <div className="bg-zinc-900 p-6 rounded-full animate-pulse">
          <Lock size={48} className="text-gray-500" />
        </div>
        <h2 className="text-3xl font-bold">Player Locked</h2>
        <p className="text-zinc-500 max-w-sm">
          You need a Premium plan to access the full player experience.
        </p>
        <Link href="/premium">
          <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-transform hover:scale-105">
            Check Plans
          </button>
        </Link>
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-black text-white p-6 text-center">
        <Music size={64} className="mb-4 text-zinc-700" />
        <h2 className="text-2xl font-bold">Nothing Playing</h2>
        <p className="text-zinc-500 mt-2">Pick a song from  Search to start listening.</p>
      </div>
    );
  }

  const handleProgress = (curr: number, dur: number) => {
    setCurrentTime(curr);
    setDuration(dur);
  };

  const handleSeek = (time: number) => {
    setSeekTo(time);
    setTimeout(() => setSeekTo(null), 100);
  };

  return (
    <>
      {/* YouTube Video Player (Hidden by default, shown when isVideoMode is true) */}
      {currentSong && currentSong.videoId && (
        <YouTubePlayer
          videoId={currentSong.videoId}
          soundEnabled={soundEnabled}
          isPlaying={isPlaying}
          seekTo={seekTo}
          onEnableSound={() => setSoundEnabled(true)}
          onSongEnd={() => {}}
          onProgress={handleProgress}
          isVideoMode={isVideoMode}
          onToggleVideo={() => setIsVideoMode(!isVideoMode)}
        />
      )}

      <div className="min-h-screen bg-black text-white flex flex-col md:flex-row p-6 pb-32 gap-8 max-w-7xl mx-auto">

        {/* LEFT: NOW PLAYING */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* Glow Effect */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="relative w-72 h-72 md:w-96 md:h-96 rounded-lg shadow-2xl object-cover"
            />
            
            {/* Video Icon Button */}
            <button
              onClick={() => setIsVideoMode(!isVideoMode)}
              className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110 z-10"
              title={isVideoMode ? "Hide Video" : "Show Video"}
            >
              <span className="text-2xl">{isVideoMode ? "📺" : "🎬"}</span>
            </button>
          </div>

          <div className="mt-8 space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-patrick-hand tracking-wide">
              {currentSong.title}
            </h1>
            <p className="text-xl text-zinc-400">
              {currentSong.artist}
            </p>
          </div>
        </div>

      {/* RIGHT: UP NEXT QUEUE */}
      <div className="flex-1 bg-[#18181b] rounded-2xl p-6 overflow-y-auto max-h-[600px] border border-[#27272a]">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-green-500">⏭</span> Up Next
        </h3>

        {queue.length === 0 ? (
          <div className="text-zinc-500 text-center py-10">
            <p>We're finding more music for you...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((song, index) => (
              <div
                key={`${song.videoId}-${index}`}
                onClick={() => playSong(song)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
              >
                <span className="text-zinc-500 w-6 font-mono text-sm group-hover:text-green-500">
                  {index + 1}
                </span>
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate group-hover:text-green-400 transition-colors">
                    {song.title}
                  </p>
                  <p className="text-sm text-zinc-500 truncate">
                    {song.artist}
                  </p>
                </div>
                <div className="text-zinc-600 group-hover:text-white">
                  <Play size={16} fill="currentColor" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
}