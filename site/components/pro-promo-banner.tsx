"use client";

import Link from "next/link";
import { usePremiumStatus } from "@/lib/hooks/use-premium-status";
import { PRICE_DISPLAY } from "@/lib/constants";

export function ProPromoBanner() {
  const { isPremium, isLoading } = usePremiumStatus();

  // Don't show to premium users or while loading
  if (isLoading || isPremium) return null;

  return (
    <section className="my-12 p-6 sm:p-8 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-1 text-center sm:text-left">
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
            className="inline-flex items-center px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            Get Pro Access &rarr;
          </Link>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
            30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
}
