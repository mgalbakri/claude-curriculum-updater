"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Phase, Appendix } from "@/lib/types";

interface MobileNavProps {
  phases: Phase[];
  appendices: Appendix[];
}

export function MobileNav({ phases, appendices }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Toggle navigation"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-lg z-50 max-h-[70vh] overflow-y-auto p-4">
          {phases.map((phase) => (
            <div key={phase.number} className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                Phase {phase.number}: {phase.name}
              </div>
              {phase.weeks.map((week) => {
                const href = `/week/${week.number}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={week.number}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2 rounded text-sm ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-800 font-medium"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {week.number}. {week.title}
                  </Link>
                );
              })}
            </div>
          ))}
          {appendices.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                Appendices
              </div>
              {appendices.map((a) => (
                <Link
                  key={a.letter}
                  href={`/appendix/${a.letter.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded text-sm text-gray-600 dark:text-gray-400"
                >
                  {a.letter}. {a.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
