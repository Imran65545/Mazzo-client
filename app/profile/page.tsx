"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/api";
import { usePlayer } from "@/context/PlayerContext";
import { Heart, Gem } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<"history" | "liked">("liked");
    const [likedSongs, setLikedSongs] = useState<any[]>([]);
    const { playSong, user } = usePlayer();
    const router = useRouter();

    // 🔒 Auth is handled by AuthGuard. If we are here, we are logged in.
    // However, if token is missing manually, we can redirect or show empty.

    // Move token reading inside effect/state to handle re-renders after login
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        setToken(t);
    }, []);

    useEffect(() => {
        if (token && activeTab === "liked") {
            fetchLikedSongs();
        }
    }, [activeTab, token]);

    const fetchLikedSongs = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/activity/liked`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                // Token invalid
                handleLogout();
                return;
            }

            const data = await res.json();

            if (Array.isArray(data)) {
                setLikedSongs(data);
            } else {
                setLikedSongs([]);
            }
        } catch (error) {
            console.error("Failed to fetch liked songs", error);
            setLikedSongs([]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white pb-48">

            {/* 💎 Premium / Plan Section */}
            <div className="pt-20 px-6 md:px-8 mb-4 max-w-5xl mx-auto w-full">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">

                    {/* Your Plan Card */}
                    <div className="bg-[#1f1f22] p-4 rounded-lg flex-1 border-l-4 border-gray-400 flex flex-col justify-center">
                        <span className="uppercase text-[10px] font-bold tracking-widest text-gray-400 mb-1">Your plan</span>
                        <span className="text-2xl font-bold">
                            Mazzo {user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : "Free"}
                        </span>
                    </div>

                    {/* Join Premium Card */}
                    <Link href="/premium" className="flex-1">
                        <div className="bg-gradient-to-r from-[#450af5] to-[#8e44ad] p-4 rounded-lg flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-transform">
                            <div className="flex flex-col">
                                <span className="flex items-center gap-2 font-bold text-lg">
                                    <Gem size={20} className="fill-white" />
                                    Join Premium
                                </span>
                                <span className="text-xs text-white/80">Unlock ad-free & high quality</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* 🎨 Header Section (Gradient) */}
            <div className="bg-gradient-to-b from-purple-800 to-[#121212] pt-10 px-6 md:px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                {/* Big Heart Icon */}
                <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-[#450af5] to-[#c4efd9] shadow-2xl flex items-center justify-center shrink-0">
                    <Heart size={60} className="text-white fill-white md:w-[80px] md:h-[80px]" />
                </div>

                {/* Text Info */}
                <div className="flex flex-col gap-2">
                    <span className="uppercase text-xs font-bold tracking-wider hidden md:block">Playlist</span>
                    <h1 className="text-4xl md:text-8xl font-black tracking-tighter shadow-lg">Liked Songs</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-medium text-gray-300 mt-2">
                        <span>{user?.email || "User"}</span>
                        <span>•</span>
                        <span>{likedSongs.length} songs</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="mt-4 md:mt-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors w-max mx-auto md:mx-0"
                    >
                        Log out
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="px-8 mt-4">
                {/* Sticky Play Button Row could go here */}

                <div className="mt-4">
                    {likedSongs.length === 0 ? (
                        <p className="text-gray-400 text-lg mt-10">No liked songs yet.</p>
                    ) : (
                        <div className="space-y-0">
                            {/* Header Row */}
                            <div className="grid grid-cols-[auto_1fr_1fr] gap-4 mb-4 text-gray-400 text-sm border-b border-white/10 pb-2 px-4 uppercase font-normal">
                                <span>#</span>
                                <span>Title</span>
                                <span>Artist</span>
                            </div>

                            {likedSongs.map((song, index) => (
                                <div
                                    key={song._id}
                                    onClick={() => playSong({
                                        videoId: song.videoId,
                                        title: song.title,
                                        artist: song.artist,
                                        thumbnail: `https://img.youtube.com/vi/${song.videoId}/default.jpg`
                                    })}
                                    className="grid grid-cols-[auto_1fr_1fr] items-center gap-4 cursor-pointer hover:bg-white/10 p-2 px-4 rounded transition-colors group"
                                >
                                    <span className="text-gray-400 text-sm w-4">{index + 1}</span>

                                    <div className="flex items-center gap-4">
                                        <img
                                            src={`https://img.youtube.com/vi/${song.videoId}/default.jpg`}
                                            alt={song.title}
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                        <div>
                                            <p className="text-base font-medium text-white group-hover:text-green-500 transition-colors line-clamp-1">{song.title}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-400 line-clamp-1">{song.artist}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
