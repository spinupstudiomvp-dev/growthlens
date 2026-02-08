import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name") || "LinkedIn User";
  const score = parseInt(searchParams.get("score") || "0");
  const grade = searchParams.get("grade") || "?";
  const profileScore = parseInt(searchParams.get("profile") || "0");
  const contentScore = parseInt(searchParams.get("content") || "0");
  const engagementScore = parseInt(searchParams.get("engagement") || "0");
  const consistencyScore = parseInt(searchParams.get("consistency") || "0");
  const strategyScore = parseInt(searchParams.get("strategy") || "0");

  const categories = [
    { name: "Profile", score: profileScore, color: "#10b981" },
    { name: "Content", score: contentScore, color: "#3b82f6" },
    { name: "Engagement", score: engagementScore, color: "#8b5cf6" },
    { name: "Consistency", score: consistencyScore, color: "#f59e0b" },
    { name: "Strategy", score: strategyScore, color: "#06b6d4" },
  ];

  const scoreColor =
    score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0a0f1e 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "48px 56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top bar: logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #3b82f6, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "18px",
              fontWeight: 800,
            }}
          >
            G
          </div>
          <span style={{ color: "#e2e8f0", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px" }}>
            GrowthLens
          </span>
          <span style={{ color: "#64748b", fontSize: "16px", marginLeft: "8px" }}>LinkedIn Growth Audit</span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flex: 1, gap: "60px" }}>
          {/* Left: Score */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: "340px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span
                style={{
                  fontSize: "120px",
                  fontWeight: 800,
                  color: scoreColor,
                  lineHeight: 1,
                  letterSpacing: "-4px",
                }}
              >
                {score}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span
                  style={{
                    fontSize: "48px",
                    fontWeight: 700,
                    color: scoreColor,
                    opacity: 0.8,
                    lineHeight: 1,
                  }}
                >
                  {grade}
                </span>
                <span style={{ fontSize: "14px", color: "#64748b", letterSpacing: "2px" }}>/100</span>
              </div>
            </div>
            <div
              style={{
                marginTop: "16px",
                fontSize: "26px",
                fontWeight: 600,
                color: "#f1f5f9",
                display: "flex",
              }}
            >
              {name}
            </div>
            <div style={{ marginTop: "6px", fontSize: "15px", color: "#64748b", display: "flex" }}>
              LinkedIn Profile Score
            </div>
          </div>

          {/* Right: Category bars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              gap: "18px",
            }}
          >
            {categories.map((cat) => (
              <div key={cat.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "16px", color: "#cbd5e1", fontWeight: 500 }}>{cat.name}</span>
                  <span style={{ fontSize: "16px", color: cat.color, fontWeight: 700 }}>{cat.score}</span>
                </div>
                <div
                  style={{
                    height: "12px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.06)",
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${cat.score}%`,
                      height: "100%",
                      borderRadius: "6px",
                      background: `linear-gradient(90deg, ${cat.color}, ${cat.color}dd)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "32px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span style={{ fontSize: "16px", color: "#94a3b8" }}>
            Get your free LinkedIn audit →{" "}
            <span style={{ color: "#3b82f6", fontWeight: 600 }}>growthlens-blue.vercel.app</span>
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
