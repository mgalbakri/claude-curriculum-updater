"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePremiumStatus } from "@/lib/hooks/use-premium-status";
import { PRICE_DISPLAY } from "@/lib/constants";

const freeFeatures = [
  "Weeks 1–4: Foundation + First App",
  "Terminal, Git, Claude Code basics",
  "Build & deploy your first project",
  "Community access",
  "Email support",
];

const proFeatures = [
  "Everything in Free",
  "Weeks 5–12: Databases, Auth, Testing, Mastery",
  "MCP servers & AI agent development",
  "Advanced project templates",
  "Certificate of completion",
  "Lifetime access — no recurring fees",
];

export default function PricingPage() {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [loading, setLoading] = useState(false);

  // Initialize Lemon.js overlay when component mounts
  useEffect(() => {
    if (typeof window.createLemonSqueezy === "function") {
      window.createLemonSqueezy();
    }
  }, []);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          userId: user?.id,
        }),
      });
      const { url } = await res.json();
      if (url) {
        // Open in Lemon.js overlay if available, otherwise redirect
        if (window.LemonSqueezy?.Url?.Open) {
          window.LemonSqueezy.Url.Open(url);
        } else {
          window.location.href = url;
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
    setLoading(false);
  }

  return (
    <div className="py-8 lg:py-16 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Unlock the Full Course
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Go from foundations to mastery. One payment, lifetime access.
        </p>
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {/* Free */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/50">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Free
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            $0
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Weeks 1–4, forever free
          </p>
          <Link
            href="/week/1"
            className="block w-full text-center px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Start Learning
          </Link>
          <ul className="mt-6 space-y-3">
            {freeFeatures.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
              >
                <svg
                  className="w-4 h-4 mt-0.5 text-slate-400 dark:text-slate-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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

        {/* Pro */}
        <div className="gradient-border-animated">
          <div className="relative z-10 p-6 rounded-2xl bg-white dark:bg-slate-900">
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-orange-500 text-white text-xs font-bold">
              RECOMMENDED
            </div>
            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              Pro
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {PRICE_DISPLAY}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              One-time payment, lifetime access
            </p>

            {isPremium ? (
              <div className="w-full text-center px-4 py-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-semibold text-sm">
                &#10003; You have Pro access!
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="block w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : `Get Pro Access — ${PRICE_DISPLAY}`}
              </button>
            )}

            <ul className="mt-6 space-y-3">
              {proFeatures.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <svg
                    className="w-4 h-4 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0"
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
        </div>
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "Is this a one-time payment?",
              a: "Yes! Pay once, access all 12 weeks forever. No subscriptions, no recurring fees.",
            },
            {
              q: "What if I want a refund?",
              a: "We offer a 30-day money-back guarantee. If you're not satisfied, email us for a full refund.",
            },
            {
              q: "Do I need to sign up to start the free weeks?",
              a: "No! Weeks 1–4 are completely free with no sign-up required. Create an account only when you want to track progress.",
            },
            {
              q: "Will new content be added?",
              a: "Yes. The curriculum is automatically updated with the latest Claude Code features. Pro users get all updates for free.",
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

      {/* Guarantee */}
      <div className="text-center p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
        <div className="text-2xl mb-2">&#128170;</div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-1">
          30-Day Money-Back Guarantee
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Not satisfied? Get a full refund within 30 days, no questions asked.
        </p>
      </div>
    </div>
  );
}
