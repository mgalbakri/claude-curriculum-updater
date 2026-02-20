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
      className="block mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-amber-50 dark:from-indigo-950/20 dark:to-amber-950/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-shadow group"
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">&#127942;</span>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Certificate Earned!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            You&apos;ve completed all 12 weeks. View and download your certificate of completion.
          </p>
        </div>
        <span className="text-indigo-600 dark:text-indigo-400 text-xl group-hover:translate-x-1 transition-transform">
          &rarr;
        </span>
      </div>
    </Link>
  );
}
