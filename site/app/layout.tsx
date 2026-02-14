import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import { parseCurriculum } from "@/lib/parse-curriculum";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://agentcodeacademy.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Agent Code Academy — Free 12-Week AI Coding Course",
    template: "%s — Agent Code Academy",
  },
  description:
    "Go from zero coding knowledge to AI coding expert in 12 weeks. Learn to build real applications with Claude Code. Free, self-paced, always up-to-date.",
  keywords: [
    "Claude Code",
    "AI coding course",
    "learn to code with AI",
    "prompt engineering",
    "Claude Code tutorial",
    "free coding course",
    "AI programming",
    "MCP servers",
    "vibe coding",
    "AI agent development",
  ],
  authors: [{ name: "Agent Code Academy" }],
  creator: "Agent Code Academy",
  openGraph: {
    title: "Agent Code Academy — Free 12-Week AI Coding Course",
    description:
      "Go from zero coding knowledge to AI coding expert in 12 weeks. Learn to build real applications with Claude Code.",
    url: BASE_URL,
    siteName: "Agent Code Academy",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Code Academy — Free 12-Week AI Coding Course",
    description:
      "Go from zero coding knowledge to AI coding expert in 12 weeks. Free, self-paced, always up-to-date.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const curriculum = parseCurriculum();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              name: "Agent Code Academy — AI Coding Course",
              description:
                "Go from zero coding knowledge to AI coding expert in 12 weeks. Learn to build real applications with Claude Code.",
              provider: {
                "@type": "Organization",
                name: "Agent Code Academy",
                url: BASE_URL,
              },
              url: BASE_URL,
              isAccessibleForFree: true,
              hasCourseInstance: {
                "@type": "CourseInstance",
                courseMode: "online",
                courseWorkload: "PT168H",
              },
              numberOfCredits: 12,
              educationalLevel: "Beginner",
              inLanguage: "en",
              teaches: [
                "AI-assisted coding",
                "Claude Code",
                "Terminal and command line",
                "Git and version control",
                "React and Next.js",
                "Databases and APIs",
                "MCP servers",
                "AI agent development",
              ],
            }),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen">
            <Sidebar
              phases={curriculum.phases}
              appendices={curriculum.appendices}
            />
            <div className="flex-1 min-w-0">
              {/* Mobile header */}
              <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
                <MobileNav
                  phases={curriculum.phases}
                  appendices={curriculum.appendices}
                />
                <span className="text-sm font-semibold">
                  Agent Code Academy
                </span>
                <ThemeToggle />
              </header>
              {/* Desktop theme toggle */}
              <div className="hidden lg:flex justify-end p-3">
                <ThemeToggle />
              </div>
              <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
