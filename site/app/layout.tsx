import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Claude Code Mastery — Free 12-Week Course",
  description:
    "Go from zero coding knowledge to Claude Code expert in 12 weeks. Free, self-paced, always up-to-date.",
  openGraph: {
    title: "Claude Code Mastery — Free 12-Week Course",
    description:
      "Go from zero coding knowledge to Claude Code expert in 12 weeks.",
    type: "website",
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
                  Claude Code Mastery
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
      </body>
    </html>
  );
}
