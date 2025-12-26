"use client";

import YouTube from "react-youtube";
import { useRef, useEffect } from "react";

type Props = {
  videoId: string;
  soundEnabled: boolean;
  isPlaying: boolean;
  seekTo: number | null; // Added
  onEnableSound: () => void;
  onSongEnd: () => void;
  onProgress: (currentTime: number, duration: number) => void; // Added
};

export default function YouTubePlayer({
  videoId,
  soundEnabled,
  isPlaying,
  seekTo,
  onEnableSound,
  onSongEnd,
  onProgress,
}: Props) {
  const playerRef = useRef<any>(null);

  const opts = {
    height: "1",
    width: "1",
    playerVars: {
      autoplay: 1,
      controls: 0,
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

  // Handle Seeking via prop change (naive approach, better handled via callback/ref usually, but props work for unidirectional flow)
  useEffect(() => {
    if (playerRef.current && seekTo !== null) {
      playerRef.current.seekTo(seekTo, true);
    }
  }, [seekTo]);

  // 🔊 Automatically manage sound when soundEnabled changes (NOT videoId, onReady handles new videos)
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

  const handleEnableSound = () => {
    if (playerRef.current) {
      playerRef.current.unMute();
      playerRef.current.setVolume(80);
      onEnableSound();
    }
  };

  return (
    <>
      {/* Hidden YouTube Player */}
      <div className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={(e) => {
            playerRef.current = e.target;
            // Ensure correct state on load
            if (soundEnabled) {
              e.target.unMute();
              e.target.setVolume(80);
            }
          }}
          onEnd={onSongEnd}
        />
      </div>

      {/* Overlay Button for Browser Autoplay Restrictions */}

    </>
  );
}