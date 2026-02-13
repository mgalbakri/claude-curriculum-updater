import Link from "next/link";
import { parseCurriculum } from "@/lib/parse-curriculum";
import { WeekCard } from "@/components/week-card";

const phaseColors: Record<
  number,
  { badge: string; accent: string }
> = {
  1: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  2: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    accent: "text-blue-600 dark:text-blue-400",
  },
  3: {
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    accent: "text-purple-600 dark:text-purple-400",
  },
};

export default function HomePage() {
  const curriculum = parseCurriculum();

  return (
    <div className="py-8 lg:py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
          100% Free · Self-Paced · Always Up-to-Date
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
          Claude Code Mastery
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-2">
          {curriculum.goal}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          {curriculum.edition} · {curriculum.duration}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/week/1"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-base hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg shadow-gray-900/10 dark:shadow-white/10"
          >
            Start Learning →
          </Link>
          <Link
            href="#curriculum"
            className="inline-flex items-center px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-base hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            View Curriculum
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        {[
          { label: "Weeks", value: "12" },
          { label: "Phases", value: "3" },
          {
            label: "Topics",
            value: String(
              curriculum.phases.reduce(
                (acc, p) =>
                  acc + p.weeks.reduce((a, w) => a + w.topics.length, 0),
                0
              )
            ),
          },
          { label: "Appendices", value: String(curriculum.appendices.length) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Phases & Weeks */}
      <section id="curriculum" className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Course Curriculum
        </h2>

        {curriculum.phases.map((phase) => {
          const colors = phaseColors[phase.number] || phaseColors[1];
          return (
            <div key={phase.number} className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg ${colors.badge}`}
                >
                  Phase {phase.number}
                </span>
                <div>
                  <h3 className={`text-lg font-semibold ${colors.accent}`}>
                    {phase.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {phase.weekRange}
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {phase.weeks.map((week) => (
                  <WeekCard key={week.number} week={week} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Appendices */}
      {curriculum.appendices.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Reference Appendices
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {curriculum.appendices.map((appendix) => (
              <Link
                key={appendix.letter}
                href={`/appendix/${appendix.letter.toLowerCase()}`}
                className="block p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all bg-white dark:bg-gray-900"
              >
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  Appendix {appendix.letter}
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {appendix.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Built with Claude Code · Content auto-updated via MCP
        </p>
        <p className="mt-1">{curriculum.edition}</p>
      </footer>
    </div>
  );
}
