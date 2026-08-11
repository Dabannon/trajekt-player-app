"use client";

import { PlayerApp } from "@/components/occlusion-mobile";

export default function Home() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#030303" }}>
      <PlayerApp defaultDifficulty="Standard" skipAuth={false} />
    </div>
  );
}
