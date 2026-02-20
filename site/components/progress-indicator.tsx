"use client";

interface ProgressIndicatorProps {
  completed: boolean;
}

export function ProgressIndicator({ completed }: ProgressIndicatorProps) {
  if (!completed) return null;

  return (
    <svg
      className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      aria-label="Completed"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
