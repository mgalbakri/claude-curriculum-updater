"use client";

import Link from "next/link";
import { usePremiumStatus } from "@/lib/hooks/use-premium-status";
import { PRICE_DISPLAY } from "@/lib/constants";

export function UpgradeCta() {
  const { isPremium, isLoading } = usePremiumStatus();

  if (isLoading || isPremium) return null;

  return (
    <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <Link
        href="/pricing"
        className="block text-center group"
      >
        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          Upgrade to Pro — {PRICE_DISPLAY}
        </p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
          Unlock all 12 weeks + certificate
        </p>
      </Link>
    </div>
  );
}
