import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Cal Hacks Portal", template: "%s · Cal Hacks Portal" },
  description: "Apply to Cal Hacks as a hacker, judge, mentor, or volunteer.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
