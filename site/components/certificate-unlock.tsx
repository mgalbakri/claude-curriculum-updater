"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress-context";
import { useAuth } from "@/lib/auth-context";
import { TOTAL_WEEKS } from "@/lib/constants";

export function CertificateUnlock() {
  const { user } = useAuth();
  const { completedWeeks } = useProgress();

  // Only show when logged in and all weeks complete
  if (!user || completedWeeks.length < TOTAL_WEEKS) return null;

  return (
    <Link
      href="/certificate"
      className="block mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/20 dark:to-amber-950/20 border border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-shadow group"
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">&#127942;</span>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Certificate Earned!
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You&apos;ve completed all 12 weeks. View and download your certificate of completion.
          </p>
        </div>
        <span className="text-emerald-600 dark:text-emerald-400 text-xl group-hover:translate-x-1 transition-transform">
          &rarr;
        </span>
      </div>
    </Link>
  );
}
