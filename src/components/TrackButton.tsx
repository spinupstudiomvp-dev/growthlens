"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function TrackButton({ profileUrl }: { profileUrl: string }) {
  const { user, loginWithLinkedIn } = useAuth();
  const [tracked, setTracked] = useState(false);

  const handleTrack = async () => {
    if (!user) {
      loginWithLinkedIn();
      return;
    }
    // TODO: Call Convex trackProfile mutation with real userId
    void profileUrl;
    setTracked(true);
  };

  return (
    <button
      onClick={handleTrack}
      disabled={tracked}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        tracked
          ? "bg-accent/10 text-accent border border-accent/20 cursor-default"
          : "border border-white/[0.08] text-slate-300 hover:text-white hover:border-accent/30 hover:bg-accent/5"
      }`}
    >
      {tracked ? "✓ Tracking" : "📊 Track this profile"}
    </button>
  );
}
