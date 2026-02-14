import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 lg:py-24 text-center">
      <p className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">
        404
      </p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist. It may have been
        moved or the URL might be incorrect.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/week/1"
          className="inline-flex items-center px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          Start Week 1
        </Link>
      </div>
    </div>
  );
}
