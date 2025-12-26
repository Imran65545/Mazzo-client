"use client";

import SearchSongs from "@/components/SearchSongs";
import { usePlayer } from "@/context/PlayerContext";

export default function SearchPage() {
    const { playSong } = usePlayer();

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center pt-20">
            <h1 className="text-4xl font-bold mb-8">Search Songs</h1>
            <div className="w-full max-w-md">
                <SearchSongs onSelect={playSong} />
            </div>
        </div>
    );
}
