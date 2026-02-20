"use client";

import { getToolsForWeek } from "@/lib/affiliate-tools";

interface ContextualToolCtaProps {
  weekNumber: number;
}

export function ContextualToolCta({ weekNumber }: ContextualToolCtaProps) {
  const tools = getToolsForWeek(weekNumber, 2);

  if (tools.length === 0) return null;

  return (
    <aside className="my-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
        Recommended for this week
      </h4>
      <div className="flex flex-col sm:flex-row gap-3">
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-1 flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              {tool.category.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {tool.name}
                <span className="inline-block ml-1 text-gray-400 dark:text-gray-600 group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {tool.description}
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-2">
        Some links may be affiliate links. We only recommend tools we genuinely use.
      </p>
    </aside>
  );
}
