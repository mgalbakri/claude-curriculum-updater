"use client";

interface CertificateProps {
  name: string;
  date: string;
  certificateId: string;
}

export function Certificate({ name, date, certificateId }: CertificateProps) {
  return (
    <div
      id="certificate"
      className="w-full max-w-3xl mx-auto aspect-[1.414/1] bg-white text-gray-900 rounded-lg shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
    >
      {/* Outer border */}
      <div className="w-full h-full border-[6px] border-emerald-600 p-2">
        {/* Inner border */}
        <div className="w-full h-full border-2 border-emerald-300 flex flex-col items-center justify-center text-center px-8 py-12 sm:px-16 sm:py-16 relative">
          {/* Corner accents */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-400" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-400" />

          {/* Header */}
          <div className="mb-2">
            <div className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 mb-1">
              Agent Code Academy
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-1">
            Certificate of Completion
          </h1>

          <div className="w-24 h-0.5 bg-emerald-500 my-4 sm:my-6" />

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
            This is to certify that
          </p>

          {/* Name */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-4xl font-bold text-emerald-700 mb-1">
              {name}
            </h2>
            <div className="w-64 h-px bg-gray-300 mx-auto" />
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-600 max-w-lg mb-6 sm:mb-8 leading-relaxed">
            has successfully completed all 12 weeks of the{" "}
            <strong className="text-gray-900">Agent Code Academy</strong> course,
            demonstrating proficiency in AI-powered coding with Claude Code,
            including terminal operations, project architecture, database integration,
            testing, MCP servers, and production deployment.
          </p>

          {/* Date & ID */}
          <div className="flex items-center gap-8 sm:gap-12 text-xs sm:text-sm text-gray-500">
            <div>
              <div className="font-semibold text-gray-700 mb-0.5">{date}</div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400">
                Date of Completion
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <div className="font-mono text-gray-700 mb-0.5 text-[10px] sm:text-xs">
                {certificateId}
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400">
                Certificate ID
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div className="absolute bottom-6 sm:bottom-8 text-[10px] sm:text-xs text-gray-400 tracking-wider">
            agentcodeacademy.com
          </div>
        </div>
      </div>
    </div>
  );
}
