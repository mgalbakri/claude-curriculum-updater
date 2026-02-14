"use client";

import { useState, type FormEvent } from "react";

const FORMSPREE_ID = "mgolkeaa";

export function EmailSignup() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      }
    } catch {
      // Falls back gracefully
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="my-16 text-center p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
        <div className="text-2xl mb-2">&#10003;</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          You&apos;re on the list!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We&apos;ll send you updates on new lessons, tips, and Claude Code news.
        </p>
      </section>
    );
  }

  return (
    <section className="my-16 p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Stay Updated
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Get notified about new lessons, curriculum updates, and Claude Code tips.
        No spam, ever.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
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
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">
        Free forever. Unsubscribe anytime.
      </p>
    </section>
  );
}
