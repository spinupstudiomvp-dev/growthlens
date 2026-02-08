"use client";
import { useEffect, useRef, useCallback } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAACZS7K3kP8Q-I3QD";

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
  const rendered = useRef(false);
  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  const tryRender = useCallback(() => {
    if (rendered.current || !ref.current || !window.turnstile) return;
    rendered.current = true;
    window.turnstile.render(ref.current, {
      sitekey: SITE_KEY,
      theme: "dark",
      callback: (token: string) => onVerifyRef.current(token),
    });
  }, []);

  useEffect(() => {
    if (window.turnstile) {
      tryRender();
      return;
    }
    if (document.querySelector('script[src*="turnstile"]')) return;
    window.onTurnstileLoad = () => tryRender();
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    script.async = true;
    document.head.appendChild(script);
  }, [tryRender]);

  return <div ref={ref} className="my-4" />;
}
