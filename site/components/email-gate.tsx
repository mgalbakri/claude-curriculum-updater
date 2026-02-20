"use client";

import { useState, type FormEvent } from "react";
import { useEmailStatus } from "@/lib/hooks/use-email-status";
import {
  FORMSPREE_ID,
  FREE_WEEKS,
  CHEAT_SHEET_PATH,
} from "@/lib/constants";

interface EmailGateProps {
  weekNumber: number;
}

export function EmailGate({ weekNumber }: EmailGateProps) {
  const { isSubscribed, isGateSkipped, isLoading, markSubscribed, markGateSkipped } =
    useEmailStatus();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Don't show on free weeks, if already subscribed, or if skipped
  if (
    isLoading ||
    (FREE_WEEKS as readonly number[]).includes(weekNumber) ||
    isSubscribed ||
    isGateSkipped
  ) {
    return null;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData(e.currentTarget);

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setSubmitted(true);
        markSubscribed();
      }
    } catch {
      // Falls back gracefully
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="my-8 p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center">
        <div className="text-3xl mb-3">&#10003;</div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          You&apos;re in! Full access unlocked.
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          As a bonus, grab your free AI Coding Cheat Sheet:
        </p>
        <a
          href={CHEAT_SHEET_PATH}
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
        >
          &#8595; Download Cheat Sheet (PDF)
        </a>
      </div>
    );
  }

  return (
    <div className="my-8 relative">
      {/* Overlay */}
      <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-gray-900 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl text-center">
        <div className="text-3xl mb-3">&#128274;</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Continue to Week {weekNumber}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 max-w-md mx-auto">
          Enter your email to continue — plus get a free <strong>AI Coding Cheat Sheet</strong> PDF.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
          No spam, ever. Unsubscribe anytime.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-4"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full sm:flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Subscribing..." : "Continue & Get Cheat Sheet"}
          </button>
        </form>

        <button
          onClick={markGateSkipped}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline underline-offset-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
