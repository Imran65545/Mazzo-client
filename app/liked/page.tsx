"use client";

import { useEffect, useState } from "react";

import { API_URL } from "../lib/api";

export default function LikedSongsPage() {
  const [songs, setSongs] = useState<any[]>([]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  useEffect(() => {
    const fetchLiked = async () => {
      const res = await fetch(`${API_URL}/api/song/liked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setSongs(data);
    };

    if (token) fetchLiked();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-xl font-bold mb-4">❤️ Liked Songs</h1>

      {songs.map((song) => (
        <div
          key={song.videoId}
          className="flex items-center gap-4 mb-3 bg-zinc-800 p-3 rounded"
        >
          <img src={song.thumbnail} className="w-12 h-12 rounded" />
          <div>
            <p className="font-semibold">{song.title}</p>
            <p className="text-sm text-gray-400">{song.artist}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
