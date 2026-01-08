"use client";

import { useEffect, useState } from "react";
import { API_URL } from "../lib/api";
import { usePlayer } from "@/context/PlayerContext";

export default function LikedSongsPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const { playSong, toggleLike } = usePlayer();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const res = await fetch(`${API_URL}/api/activity/liked`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setSongs(data);
      } catch (err) {
        console.error("Error fetching liked songs:", err);
      }
    };

    if (token) fetchLiked();
  }, [token]);

  const handleUnlike = async (song: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent playing the song when clicking unlike
    
    try {
      const res = await fetch(`${API_URL}/api/activity/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoId: song.videoId,
          title: song.title,
          artist: song.artist,
          genre: song.genre,
        }),
      });

      if (res.ok) {
        // Remove from local state
        setSongs((prev) => prev.filter((s) => s.videoId !== song.videoId));
      }
    } catch (err) {
      console.error("Error unliking song:", err);
    }
  };

  const handlePlaySong = (song: any) => {
    playSong({
      videoId: song.videoId,
      title: song.title,
      artist: song.artist,
      thumbnail: song.thumbnail || `https://img.youtube.com/vi/${song.videoId}/default.jpg`,
      genre: song.genre,
    }, true); // Pass true since we know it's liked (it's from the liked page)
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-32">
      <h1 className="text-2xl font-bold mb-6">❤️ Liked Songs</h1>

      {songs.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>No liked songs yet. Start liking songs to see them here!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song) => (
            <div
              key={song.videoId}
              onClick={() => handlePlaySong(song)}
              className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer transition-colors group"
            >
              <img 
                src={song.thumbnail || `https://img.youtube.com/vi/${song.videoId}/default.jpg`} 
                className="w-12 h-12 rounded object-cover" 
                alt={song.title}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{song.title}</p>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
              <button
                onClick={(e) => handleUnlike(song, e)}
                className="p-2 rounded-full transition-all active:scale-90 text-red-500 hover:bg-red-500/20"
                title="Remove from liked songs"
              >
                <span className="text-xl">❤️</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
