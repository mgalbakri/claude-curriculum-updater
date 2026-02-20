"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Phase, Appendix } from "@/lib/types";
import { useProgress } from "@/lib/progress-context";
import { useAuth } from "@/lib/auth-context";
import { ProgressIndicator } from "@/components/progress-indicator";
import { PremiumBadge } from "@/components/premium-badge";
import { UpgradeCta } from "@/components/upgrade-cta";
import { ToolRecommendationWidget } from "@/components/tool-recommendation-widget";
import { TOTAL_WEEKS } from "@/lib/constants";

interface SidebarProps {
  phases: Phase[];
  appendices: Appendix[];
}

const phaseColors: Record<number, string> = {
  1: "text-emerald-600 dark:text-emerald-400",
  2: "text-blue-600 dark:text-blue-400",
  3: "text-purple-600 dark:text-purple-400",
};

const phaseBgColors: Record<number, string> = {
  1: "bg-emerald-50 dark:bg-emerald-950/30",
  2: "bg-blue-50 dark:bg-blue-950/30",
  3: "bg-purple-50 dark:bg-purple-950/30",
};

export function Sidebar({ phases, appendices }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { completedWeeks, completionPercentage } = useProgress();

  return (
    <nav className="w-72 h-screen sticky top-0 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 hidden lg:block">
      <Link href="/" className="block mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Agent Code Academy
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          12-Week AI Coding Course
        </p>
      </Link>

      {/* Progress bar (logged-in users only) */}
      {user && (
        <div className="mb-5 px-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Progress</span>
            <span>{completedWeeks.length}/{TOTAL_WEEKS} weeks</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {phases.map((phase) => (
        <div key={phase.number} className="mb-5">
          <div
            className={`text-xs font-semibold uppercase tracking-wider mb-2 px-2 py-1 rounded ${phaseColors[phase.number]} ${phaseBgColors[phase.number]}`}
          >
            Phase {phase.number}: {phase.name}
          </div>
          <ul className="space-y-0.5">
            {phase.weeks.map((week) => {
              const href = `/week/${week.number}`;
              const isActive = pathname === href;
              const isComplete = completedWeeks.includes(week.number);
              return (
                <li key={week.number}>
                  <Link
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <ProgressIndicator completed={isComplete} />
                    <span className="text-gray-400 dark:text-gray-600 mr-0.5 text-xs">
                      {week.number}.
                    </span>
                    <span className="flex-1 truncate">{week.title}</span>
                    <PremiumBadge weekNumber={week.number} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {appendices.length > 0 && (
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-2 py-1 rounded text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
            Appendices
          </div>
          <ul className="space-y-0.5">
            {appendices.map((appendix) => {
              const href = `/appendix/${appendix.letter.toLowerCase()}`;
              const isActive = pathname === href;
              return (
                <li key={appendix.letter}>
                  <Link
                    href={href}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <span className="text-gray-400 dark:text-gray-600 mr-1.5 text-xs">
                      {appendix.letter}.
                    </span>
                    {appendix.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Certificate link (when all complete) */}
      {completedWeeks.length === TOTAL_WEEKS && (
        <div className="mb-5">
          <Link
            href="/certificate"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors"
          >
            <span>&#127942;</span>
            View Certificate
          </Link>
        </div>
      )}

      {/* Upgrade CTA */}
      <UpgradeCta />

      {/* Tool Recommendations */}
      <ToolRecommendationWidget />
    </nav>
  );
}
