"use client";

import Link from "next/link";
import { usePremiumStatus } from "@/lib/hooks/use-premium-status";
import { PRICE_DISPLAY } from "@/lib/constants";

export function UpgradeCta() {
  const { isPremium, isLoading } = usePremiumStatus();

  if (isLoading || isPremium) return null;

  return (
    <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
      <Link
        href="/pricing"
        className="block text-center group"
      >
        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
          Upgrade to Pro — {PRICE_DISPLAY}
        </p>
        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">
          Unlock all 12 weeks + certificate
        </p>
      </Link>
    </div>
  );
}
