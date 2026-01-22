import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    artist: { type: String },
    genre: { type: String },
    duration: { type: Number },
    thumbnail: { type: String },
  },
  { timestamps: true }
);

songSchema.index({ artist: 1 });
songSchema.index({ genre: 1 });

export default mongoose.models.Song || mongoose.model("Song", songSchema);
