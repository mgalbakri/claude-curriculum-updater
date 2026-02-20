"use client";

import { affiliateTools } from "@/lib/affiliate-tools";

export function ToolRecommendationWidget() {
  // Show top 2 tools in sidebar
  const tools = affiliateTools.slice(0, 2);

  return (
    <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
        Recommended Tools
      </h4>
      <div className="space-y-2">
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <span className="font-medium">{tool.name}</span>
            <span className="text-gray-400 dark:text-gray-600 ml-1">
              &rarr;
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
