"use client";

import Link from "next/link";
import { usePremiumStatus } from "@/lib/hooks/use-premium-status";
import { PRICE_DISPLAY } from "@/lib/constants";

export function ProPromoBanner() {
  const { isPremium, isLoading } = usePremiumStatus();

  // Don't show to premium users or while loading
  if (isLoading || isPremium) return null;

  return (
    <section className="my-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-emerald-950/20 dark:via-gray-900 dark:to-blue-950/20 border border-emerald-200 dark:border-emerald-800/50">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-1 text-center sm:text-left">
          <div className="inline-block mb-2 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Pro
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Unlock the Full Course
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg">
            Get access to all 12 weeks of content including advanced workflows,
            multi-agent systems, production deployment, and a certificate of
            completion. One-time payment, lifetime access.
          </p>
        </div>
        <div className="flex-shrink-0 text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {PRICE_DISPLAY}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            one-time payment
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20"
          >
            Get Pro Access →
          </Link>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
            30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
}
