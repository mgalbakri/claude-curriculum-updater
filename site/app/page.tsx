import Link from "next/link";
import { parseCurriculum } from "@/lib/parse-curriculum";
import { WeekCard } from "@/components/week-card";
import { EmailSignup } from "@/components/email-signup";
import { InlineEmailCta } from "@/components/inline-email-cta";
import { ProPromoBanner } from "@/components/pro-promo-banner";
import { affiliateTools } from "@/lib/affiliate-tools";

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
          Start Free · Self-Paced · Always Up-to-Date
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
          Agent Code Academy
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
            <div key={phase.number}>
              <div className="mb-12">
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
              {phase.number === 1 && (
                <InlineEmailCta message="Enjoying the foundations? Get updates as new content drops." />
              )}
              {phase.number === 2 && (
                <InlineEmailCta message="Ready for advanced topics? Subscribe for tips and updates." />
              )}
            </div>
          );
        })}
      </section>

      {/* Pro Promo Banner */}
      <ProPromoBanner />

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

      {/* Email Signup */}
      <EmailSignup />

      {/* Recommended Tools */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Recommended Tools
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Essential tools for getting the most out of your Claude Code journey.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {affiliateTools.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all bg-white dark:bg-gray-900 group"
            >
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wider">
                {tool.category}
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {tool.name}
                <span className="inline-block ml-1 text-gray-400 dark:text-gray-600 group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {tool.description}
              </p>
            </a>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-3">
          Some links may be affiliate links. We only recommend tools we genuinely use.
        </p>
      </section>

      {/* Support This Project */}
      <section className="mt-16 p-6 sm:p-8 rounded-2xl bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 text-center">
        <p className="text-2xl mb-3">&#9749;</p>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Support This Project
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-5">
          Weeks 1–4 are free to everyone. If this course has helped you,
          consider buying me a coffee to keep it growing.
        </p>
        <a
          href="https://buymeacoffee.com/curriculumbuilder"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          &#9749; Buy Me a Coffee
        </a>
      </section>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Built with Claude Code · Content auto-updated via MCP
        </p>
        <p className="mt-1">
          {curriculum.edition} ·{" "}
          <a
            href="https://buymeacoffee.com/curriculumbuilder"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
          >
            Support this project &#9749;
          </a>
        </p>
      </footer>
    </div>
  );
}
