"use client";

import Link from "next/link";
import { COURSE_IS_FREE } from "@/lib/constants";

const allFeatures = [
  "All 12 weeks of content — beginner to advanced",
  "Terminal, Git, and Claude Code fundamentals",
  "Build & deploy real projects",
  "Databases, authentication, and testing",
  "MCP servers & AI agent development",
  "Advanced project templates",
  "Certificate of completion",
  "Community access & email support",
  "Lifetime access — all future updates included",
];

export default function PricingPage() {
  // While the course is free, show a simplified single-tier page
  if (COURSE_IS_FREE) {
    return (
      <div className="py-8 lg:py-16 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span>&#127881;</span> Limited Time
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            100% Free — All 12 Weeks
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            The entire course is currently free while we&apos;re in early access.
            No credit card, no sign-up required to start.
          </p>
        </div>

        {/* Single card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 mb-12">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
              $0
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Free during early access
            </p>
          </div>

          <Link
            href="/week/1"
            className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20 mb-6"
          >
            Start Learning — It&apos;s Free
          </Link>

          <ul className="space-y-3">
            {allFeatures.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <svg
                  className="w-4 h-4 mt-0.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Is this really free?",
                a: "Yes! All 12 weeks are completely free during early access. No credit card required.",
              },
              {
                q: "Will this become paid later?",
                a: "We may introduce a Pro tier in the future, but early access users can enjoy the full course free of charge.",
              },
              {
                q: "Do I need to sign up?",
                a: "No! You can start learning immediately. Create an account only if you want to track your progress across devices.",
              },
              {
                q: "Will new content be added?",
                a: "Yes. The curriculum is automatically updated with the latest Claude Code features. All updates are free.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                  {q}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Early access note */}
        <div className="text-center p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
          <div className="text-2xl mb-2">&#128640;</div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">
            Early Access
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            You&apos;re getting the full course for free. Enjoy it, and let us know
            how we can make it even better.
          </p>
        </div>
      </div>
    );
  }

  // --- Paid mode (re-enable when Lemon Squeezy is approved) ---
  // This code is preserved for when COURSE_IS_FREE is set to false.
  return null;
}
