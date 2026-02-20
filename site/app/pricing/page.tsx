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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Unlock the Full Course
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Go from foundations to mastery. One payment, lifetime access.
        </p>
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {/* Free */}
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Free
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            $0
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Weeks 1–4, forever free
          </p>
          <Link
            href="/week/1"
            className="block w-full text-center px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Start Learning
          </Link>
          <ul className="mt-6 space-y-3">
            {freeFeatures.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <svg
                  className="w-4 h-4 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0"
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
        <div className="p-6 rounded-2xl border-2 border-emerald-500 dark:border-emerald-400 bg-white dark:bg-gray-900 relative">
          <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
            RECOMMENDED
          </div>
          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
            Pro
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {PRICE_DISPLAY}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            One-time payment, lifetime access
          </p>

          {isPremium ? (
            <div className="w-full text-center px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
              &#10003; You have Pro access!
            </div>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="block w-full text-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : `Get Pro Access — ${PRICE_DISPLAY}`}
            </button>
          )}

          <ul className="mt-6 space-y-3">
            {proFeatures.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
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
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
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
              className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                {q}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guarantee */}
      <div className="text-center p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
        <div className="text-2xl mb-2">&#128170;</div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
          30-Day Money-Back Guarantee
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Not satisfied? Get a full refund within 30 days, no questions asked.
        </p>
      </div>
    </div>
  );
}
