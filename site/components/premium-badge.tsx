"use client";

import { usePremiumStatus } from "@/lib/hooks/use-premium-status";
import { FREE_WEEKS } from "@/lib/constants";

interface PremiumBadgeProps {
  weekNumber: number;
}

export function PremiumBadge({ weekNumber }: PremiumBadgeProps) {
  const { isPremium } = usePremiumStatus();

  // No badge on free weeks
  if ((FREE_WEEKS as readonly number[]).includes(weekNumber)) {
    return null;
  }

  if (isPremium) {
    return null; // No badge needed when unlocked
  }

  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
      <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a2 2 0 0 0-2 2v4a2 2 0 1 0 4 0V3a2 2 0 0 0-2-2zm-4 6V3a4 4 0 1 1 8 0v4a4 4 0 1 1-8 0zM3 7a5 5 0 1 0 10 0V3a5 5 0 0 0-10 0v4z" />
        <path d="M5 11h6v3a3 3 0 0 1-6 0v-3z" />
      </svg>
      PRO
    </span>
  );
}
