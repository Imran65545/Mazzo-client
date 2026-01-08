"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_URL } from "../app/lib/api";

type Song = {
    videoId: string;
    title: string;
    artist: string;
    thumbnail: string;
    genre?: string;
};

type PlayerContextType = {
    currentSong: Song | null;
    queue: Song[];
    liked: boolean;
    isPlaying: boolean;
    playSong: (song: Song, isLiked?: boolean) => void;
    playNext: () => void;
    toggleLike: () => void;
    addToQueue: (songs: Song[]) => void;
    fillQueue: () => void;
    togglePlay: () => void;
    user: { plan: string, isAdmin: boolean, name: string, email: string, songsPlayed?: number } | null;

};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [queue, setQueue] = useState<Song[]>([]);
    const [liked, setLiked] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);


    // User State
    const [user, setUser] = useState<{ plan: string, isAdmin: boolean, name: string, email: string, songsPlayed?: number } | null>(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // ... (keep useEffects same)

    // Fetch recommended songs
    const fetchNextSong = async (limit = 1): Promise<Song[] | null> => {
        try {
            const res = await fetch(`${API_URL}/api/recommend/next?limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return null;
            const data = await res.json();

            // Handle Array (Batch) or Single Object
            const rawSongs = Array.isArray(data) ? data : [data];

            const songs = rawSongs
                .filter((item: any) => item && typeof item === "object") // Filter out nulls/non-objects
                .map((song: any) => {
                    if (!song.videoId) return null; // Skip invalid songs
                    if (!song.title) song.title = "Unknown Title";
                    if (!song.artist) song.artist = "Unknown Artist";
                    if (!song.thumbnail) song.thumbnail = `https://img.youtube.com/vi/${song.videoId}/default.jpg`;
                    return song as Song;
                })
                .filter((song): song is Song => song !== null); // Remove nulls

            return songs;

        } catch (error) {
            console.error("Error fetching next song:", error);
            return null;
        }
    };

    const fillQueue = async () => {
        if (!token) return;
        const newSongs = await fetchNextSong(5);
        if (newSongs && newSongs.length > 0) {
            setQueue((prev) => {
                // Filter out duplicates based on videoId
                const existingIds = new Set(prev.map(s => s.videoId));
                const uniqueNewSongs = newSongs.filter(s => !existingIds.has(s.videoId));
                return [...prev, ...uniqueNewSongs];
            });
        }
    };

    const playSong = async (song: Song, isLiked?: boolean) => {
        if (!song || !song.videoId) {
            console.error("Attempted to play invalid song:", song);
            return;
        }

        // 🔒 Plan Restriction Check
        if (user && !user.isAdmin) {
            // ... (keep restrict checks same)
            if (user.plan === "free" && (Number(user.songsPlayed) || 0) >= 10) {
                alert("🔒 Free Limit Reached\n\nYou have played 10 free songs. Upgrade to Premium for valid streaming!");
                return;
            }
            if (user.plan === "lite" && (user.songsPlayed || 0) >= 30) {
                alert("🔒 Lite Limit Reached\n\nYou have played 30 songs. Upgrade to Standard for unlimited streaming!");
                return;
            }
        }

        setCurrentSong(song);
        setIsPlaying(true);
        
        // If isLiked is explicitly passed (e.g., from liked page), use it
        if (isLiked !== undefined) {
            setLiked(isLiked);
        } else {
            // Otherwise, check like status from server
            if (token) {
                try {
                    const likeCheckRes = await fetch(`${API_URL}/api/activity/check-like?videoId=${song.videoId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (likeCheckRes.ok) {
                        const likeData = await likeCheckRes.json();
                        setLiked(likeData.liked === true);
                    } else {
                        setLiked(false);
                    }
                } catch (err) {
                    console.error("Error checking like status:", err);
                    setLiked(false);
                }
            } else {
                setLiked(false);
            }
        }
        
        // Record Play (if logged in)
        if (token) {
            fetch(`${API_URL}/api/activity/play`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            }).catch(e => console.error("Failed to record play", e)); 
        }
    };

    const playNext = async () => {
        // If queue is empty, fetch immediately
        if (queue.length === 0) {
            const songs = await fetchNextSong(1);
            if (songs && songs.length > 0) {
                playSong(songs[0]);
                fillQueue(); // Refill in background
            }
            return;
        }

        // Pop from queue
        const nextSong = queue[0];
        setQueue((prev) => prev.slice(1));

        if (nextSong) {
            playSong(nextSong);
        } else {
            // Fallback if queue somehow had a null
            const songs = await fetchNextSong(1);
            if (songs && songs.length > 0) playSong(songs[0]);
        }

        // Keep queue topped up
        if (queue.length <= 2) {
            fillQueue();
        }
    };

    const addToQueue = (songs: Song[]) => {
        setQueue((prev) => [...prev, ...songs]);
    };

    const toggleLike = async () => {
        if (!currentSong) return;

        // Optimistic update
        const newLikedState = !liked;
        setLiked(newLikedState);

        try {
            await fetch(`${API_URL}/api/activity/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    videoId: currentSong.videoId,
                    title: currentSong.title,
                    artist: currentSong.artist,
                    genre: currentSong.genre,
                }),
            });
        } catch (error) {
            console.error("Error liking song:", error);
            setLiked(!newLikedState); // Revert on error
        }
    };

    const togglePlay = async () => {
        setIsPlaying((prev) => {
            const newState = !prev;



            return newState;
        });
    };

    return (
        <PlayerContext.Provider
            value={{
                currentSong,
                queue,
                liked,
                isPlaying,
                playSong,
                playNext,
                toggleLike,
                addToQueue,
                fillQueue,
                togglePlay,
                user,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
}
