"use client";
import { useEffect, useRef, useState } from "react";

// Cloudflare Turnstile test key (always passes) — replace with real key in production
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export default function Captcha({ onVerify }: { onVerify: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load Turnstile script
    if (document.querySelector('script[src*="turnstile"]')) {
      setLoaded(true);
      return;
    }
    window.onTurnstileLoad = () => setLoaded(true);
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (loaded && ref.current && window.turnstile) {
      window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (token: string) => onVerify(token),
      });
    }
  }, [loaded, onVerify]);

  return <div ref={ref} className="my-4" />;
}
