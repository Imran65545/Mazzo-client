"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import YouTubePlayer from "./YouTubePlayer";
import PlayerControls from "./PlayerControls";

declare var cordova: any;

export default function GlobalPlayer() {
    const { currentSong, playNext, liked, toggleLike, isPlaying, togglePlay, user } = usePlayer();
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seekTo, setSeekTo] = useState<number | null>(null);
    const [isVideoMode, setIsVideoMode] = useState(false);

    useEffect(() => {
        const initBackgroundMode = () => {
            try {
                if (typeof cordova !== "undefined" && cordova.plugins?.backgroundMode) {
                    // 1. Configure notification (REQUIRED for Android 8+)
                    cordova.plugins.backgroundMode.setDefaults({
                        title: "Mazzo",
                        text: "Playing music...",
                        icon: 'ic_launcher',
                        color: "00ff00",
                        resume: true,
                        hidden: false,
                        bigText: true
                    });

                    // 2. Enable the mode
                    cordova.plugins.backgroundMode.enable();

                    // 3. Handle activation
                    cordova.plugins.backgroundMode.on("activate", () => {
                        cordova.plugins.backgroundMode.disableWebViewOptimizations();
                    });

                    // 4. Ask for battery optimizations permission
                    cordova.plugins.backgroundMode.disableBatteryOptimizations();

                    console.log("Background mode enabled successfully");
                }
            } catch (err) {
                console.error("Failed to enable background mode:", err);
            }
        };

        document.addEventListener("deviceready", initBackgroundMode, false);
        return () => document.removeEventListener("deviceready", initBackgroundMode);
    }, []);

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
                isVideoMode={isVideoMode}
                onToggleVideo={() => setIsVideoMode(!isVideoMode)}
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
                isVideoMode={isVideoMode}
                onToggleVideo={() => setIsVideoMode(!isVideoMode)}
            />
        </>
    );
}
