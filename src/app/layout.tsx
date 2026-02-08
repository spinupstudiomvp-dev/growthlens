import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowthLens — LinkedIn Growth Audit for Founders",
  description: "Analyze any LinkedIn profile strategy. Get a complete audit with actionable insights to grow your presence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
