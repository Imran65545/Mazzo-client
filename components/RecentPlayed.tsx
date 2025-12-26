"use client";
import { useEffect, useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { API_URL } from "../app/lib/api";

export default function RecentPlayed() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/activity/recent`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setSongs);
  }, []);

  return (
    <div>
      <h2 className="text-lg mb-2">Recently Played</h2>
      {songs.map((s: any) => (
        <p key={s._id}>{s.title}</p>
      ))}
    </div>
  );
}
