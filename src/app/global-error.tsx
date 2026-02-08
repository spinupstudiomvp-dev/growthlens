"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const errorCode = error.digest || error.name || "UNKNOWN";
  const errorMsg = error.message || "No message";

  return (
    <html lang="en">
      <body style={{ background: "#0a0f1e", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ maxWidth: "480px", textAlign: "center" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>⚠️ GrowthLens Error</h1>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", textAlign: "left", marginBottom: "24px" }}>
              <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 8px" }}>Code: <code style={{ color: "#fff" }}>{errorCode}</code></p>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>Error: <code style={{ color: "#fff", fontSize: "11px" }}>{errorMsg}</code></p>
            </div>
            <button onClick={reset} style={{ background: "#10b981", color: "#0a0f1e", fontWeight: 600, padding: "12px 24px", borderRadius: "12px", border: "none", cursor: "pointer", marginRight: "8px" }}>
              Try Again
            </button>
            <a href="/" style={{ color: "#fff", padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none", display: "inline-block" }}>
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
