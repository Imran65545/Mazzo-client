"use client";

import SearchSongs from "@/components/SearchSongs";
import { usePlayer } from "@/context/PlayerContext";

export default function SearchPage() {
    const { playSong } = usePlayer();

    return (
        <div className="min-h-screen bg-black text-white px-4 py-6 flex flex-col items-center pt-24 md:pt-20 pb-32">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Search Songs</h1>
            <div className="w-full max-w-md">
                <SearchSongs onSelect={playSong} />
            </div>
        </div>
    );
}
