"use client";

import { useState, useEffect, type FormEvent } from "react";
import { FORMSPREE_ID, LS_EMAIL_SUBSCRIBED as SUBSCRIBED_KEY } from "@/lib/constants";

export function InlineEmailCta({ message }: { message: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SUBSCRIBED_KEY)) {
      setSubscribed(true);
    }
  }, []);

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
        setSubscribed(true);
        localStorage.setItem(SUBSCRIBED_KEY, "1");
      }
    } catch {
      // Falls back gracefully
    } finally {
      setSubmitting(false);
    }
  }

  if (subscribed && !submitted) return null;

  if (submitted) {
    return (
      <div className="my-6 py-3 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
        Subscribed! We&apos;ll keep you posted.
      </div>
    );
  }

  return (
    <div className="my-6 flex flex-col sm:flex-row items-center justify-center gap-3 py-4 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {message}
      </p>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-shrink-0">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-44 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
