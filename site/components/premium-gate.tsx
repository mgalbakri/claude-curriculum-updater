"use client";

import Link from "next/link";
import { usePremiumStatus } from "@/lib/hooks/use-premium-status";
import { FREE_WEEKS, STRIPE_PRICE_DISPLAY } from "@/lib/constants";
import type { ReactNode } from "react";

interface PremiumGateProps {
  weekNumber: number;
  children: ReactNode;
}

export function PremiumGate({ weekNumber, children }: PremiumGateProps) {
  const { isPremium, isLoading } = usePremiumStatus();

  // Free weeks — always show
  if ((FREE_WEEKS as readonly number[]).includes(weekNumber)) {
    return <>{children}</>;
  }

  // Loading — show children to prevent layout shift (will gate on next render)
  if (isLoading) {
    return <>{children}</>;
  }

  // Premium user — show everything
  if (isPremium) {
    return <>{children}</>;
  }

  // Non-premium — show preview with blur overlay
  return (
    <div className="relative">
      {/* Content preview (first bit visible, rest blurred) */}
      <div className="relative max-h-[400px] overflow-hidden">
        {children}
        {/* Gradient fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent pointer-events-none" />
      </div>

      {/* Paywall CTA */}
      <div className="relative -mt-8 z-10">
        <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl text-center">
          <div className="text-3xl mb-3">&#128274;</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Premium Content
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 max-w-md mx-auto">
            Week {weekNumber} is part of the Pro course. Unlock all remaining
            weeks with a single payment.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
            Lifetime access &middot; All future updates included &middot;
            30-day money-back guarantee
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20"
            >
              Get Pro Access — {STRIPE_PRICE_DISPLAY}
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline underline-offset-2"
            >
              See what&apos;s included
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
