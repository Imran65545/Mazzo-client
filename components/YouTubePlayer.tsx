"use client";

import YouTube from "react-youtube";
import { useRef, useEffect } from "react";

type Props = {
  videoId: string;
  soundEnabled: boolean;
  isPlaying: boolean;
  seekTo: number | null;
  onEnableSound: () => void;
  onSongEnd: () => void;
  onProgress: (currentTime: number, duration: number) => void;
  isVideoMode: boolean; // Added
  onToggleVideo: () => void; // Added
};

export default function YouTubePlayer({
  videoId,
  soundEnabled,
  isPlaying,
  seekTo,
  onEnableSound,
  onSongEnd,
  onProgress,
  isVideoMode,
  onToggleVideo,
}: Props) {
  const playerRef = useRef<any>(null);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: isVideoMode ? 1 : 0, // Enable controls in video mode
      mute: soundEnabled ? 0 : 0,
    },
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ⏯ Controls Play/Pause
  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  // ⏱ Track Progress
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          onProgress(currentTime, duration);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  // Handle Seeking via prop change
  useEffect(() => {
    if (playerRef.current && seekTo !== null) {
      playerRef.current.seekTo(seekTo, true);
    }
  }, [seekTo]);

  // 🔊 Automatically manage sound
  useEffect(() => {
    if (playerRef.current && soundEnabled && typeof playerRef.current.unMute === 'function') {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(80);
      } catch (err) {
        console.warn("Error setting volume/mute:", err);
      }
    }
  }, [soundEnabled]);

  return (
    <>
      {/* Container that toggles between hidden/audio-only and full-screen video */}
      <div className={
        isVideoMode
          ? "fixed inset-0 z-[60] w-full h-full bg-black flex items-center justify-center transition-all duration-300"
          : "absolute w-px h-px overflow-hidden opacity-0 pointer-events-none"
      }>

        {/* Close Button for Video Mode */}
        {isVideoMode && (
          <button
            onClick={onToggleVideo}
            className="absolute top-4 right-4 z-[60] bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
          >
            ✕
          </button>
        )}

        <YouTube
          videoId={videoId}
          opts={opts}
          className={isVideoMode ? "w-full h-full" : ""}
          iframeClassName={isVideoMode ? "w-full h-full" : ""}
          onReady={(e) => {
            playerRef.current = e.target;
            if (soundEnabled) {
              e.target.unMute();
              e.target.setVolume(80);
            }
          }}
          onEnd={onSongEnd}
        />
      </div>
    </>
  );
}