import Link from "next/link";
import type { Week } from "@/lib/types";

interface WeekCardProps {
  week: Week;
}

export function WeekCard({ week }: WeekCardProps) {
  return (
    <Link
      href={`/week/${week.number}`}
      className="block p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all bg-white dark:bg-gray-900"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
          {week.number}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {week.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {week.subtitle || week.objective}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {week.topics.length} topics
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {week.activities.length} activities
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
