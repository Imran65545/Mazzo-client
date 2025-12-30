import { useState } from "react";

type Props = {
  title: string;
  artist: string;
  thumbnail: string;
  liked: boolean;
  isPlaying: boolean;
  currentTime?: number;
  duration?: number;
  onLike: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  isVideoMode: boolean; // Added
  onToggleVideo: () => void; // Added
};

export default function PlayerControls({
  title,
  artist,
  thumbnail,
  liked,
  isPlaying,
  currentTime = 0,
  duration = 0,
  onLike,
  onTogglePlay,
  onNext,
  onSeek,
  isVideoMode,
  onToggleVideo,
}: Props) {
  const [isHovering, setIsHovering] = useState(false);

  const formatTime = (time: number) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[60px] left-0 right-0 bg-zinc-900 text-white p-4 flex flex-col items-center border-t border-zinc-800 shadow-2xl z-50">

      {/* 🎵 Progress Bar (Spotify Style) */}
      <div
        className="w-full flex items-center justify-between text-xs text-gray-400 mb-2 px-2 group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <span>{formatTime(currentTime)}</span>

        <div className="relative flex-1 mx-2 h-1 bg-gray-600 rounded-full cursor-pointer group">
          {/* Progress fill */}
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-colors ${isHovering ? "bg-green-500" : "bg-white"}`}
            style={{ width: `${progressPercent}%` }}
          ></div>

          {/* Draggable Area (Invisible input on top) */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            className="absolute top-[-6px] left-0 w-full h-4 opacity-0 cursor-pointer z-10"
          />

          {/* Knob (Hidden by default, visible on group hover) */}
          <div
            className={`absolute top-1/2 -mt-1.5 h-3 w-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
            style={{ left: `${progressPercent}%`, transform: 'translateX(-50%) translateY(-25%)' }}
          />
        </div>

        <span>{formatTime(duration)}</span>
      </div>

      <div className="flex items-center w-full gap-4">
        {/* Thumbnail */}
        <img
          src={thumbnail || "https://placehold.co/150"}
          alt={title || "Song Thumbnail"}
          className="w-12 h-12 rounded object-cover shadow-md"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/150";
          }}
        />

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{title}</p>
          <p className="text-xs text-gray-400 truncate">{artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* ❤️ LIKE BUTTON */}
          <button
            onClick={onLike}
            className={`p-2 rounded-full transition-all active:scale-90 ${liked ? "text-red-500" : "text-gray-400 hover:text-white"
              }`}
            title={liked ? "Unlike" : "Like"}
          >
            <span className="text-xl">{liked ? "❤️" : "🤍"}</span>
          </button>

          {/* ⏯ PLAY/PAUSE BUTTON */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full transition-transform active:scale-90 shadow-lg"
            title={isPlaying ? "Pause" : "Play"}
          >
            <span className="text-xl">{isPlaying ? "⏸" : "▶"}</span>
          </button>

          {/* ⏭ NEXT BUTTON */}
          <button
            onClick={onNext}
            className="w-10 h-10 flex items-center justify-center bg-green-500 hover:bg-green-400 text-black rounded-full transition-transform active:scale-90 shadow-lg"
            title="Next Song"
          >
            <span className="text-xl">⏭</span>
          </button>

          {/* 📺 VIDEO TOGGLE BUTTON */}
          <button
            onClick={onToggleVideo}
            className={`p-2 rounded-full transition-all active:scale-90 ${isVideoMode ? "text-green-500 bg-green-500/10" : "text-gray-400 hover:text-white"}`}
            title="Watch Video"
          >
            <span className="text-xl">📺</span>
          </button>
        </div>
      </div>
    </div>
  );
}