"use client";

import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import YouTubePlayer from "./YouTubePlayer";
import PlayerControls from "./PlayerControls";

export default function GlobalPlayer() {
    const { currentSong, playNext, liked, toggleLike, isPlaying, togglePlay, user } = usePlayer();
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seekTo, setSeekTo] = useState<number | null>(null);

    // 🔒 Security: Do not render for Free users (non-admins)
    if (user && !user.isAdmin && user.plan === "free") {
        return null;
    }

    if (!currentSong || !currentSong.videoId) return null;

    const handleProgress = (curr: number, dur: number) => {
        setCurrentTime(curr);
        setDuration(dur);
    };

    const handleSeek = (time: number) => {
        setSeekTo(time);

        // Reset seekTo after a short delay so user can seek again to same spot if needed (though unlikely)
        // or just let the player handle it. React-youtube might need the prop to change.
        setTimeout(() => setSeekTo(null), 100);
    };

    return (
        <>
            <YouTubePlayer
                videoId={currentSong.videoId}
                soundEnabled={soundEnabled}
                isPlaying={isPlaying}
                seekTo={seekTo}
                onEnableSound={() => setSoundEnabled(true)}
                onSongEnd={playNext}
                onProgress={handleProgress}
            />

            <PlayerControls
                title={currentSong.title}
                artist={currentSong.artist}
                thumbnail={currentSong.thumbnail}
                liked={liked}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onLike={toggleLike}
                onTogglePlay={togglePlay}
                onNext={playNext}
                onSeek={handleSeek}
            />
        </>
    );
}
