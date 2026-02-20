"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LS_PREMIUM_TOKEN, COURSE_IS_FREE } from "@/lib/constants";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [email, setEmail] = useState("");

  // While the course is free, redirect anyone who lands here
  if (COURSE_IS_FREE) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="text-4xl mb-4">&#127881;</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          The Course Is Free!
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
          All 12 weeks are currently free during early access. No payment needed — just start learning!
        </p>
        <Link
          href="/week/1"
          className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Start Week 1 &rarr;
        </Link>
      </div>
    );
  }

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (!orderId) {
      setStatus("error");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(
          `/api/verify-session?order_id=${orderId}`
        );
        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data = await res.json();
        localStorage.setItem(LS_PREMIUM_TOKEN, data.token);
        setEmail(data.email);
        setStatus("success");

        // Refresh Supabase profile to pick up is_premium
        await refreshProfile();
      } catch {
        setStatus("error");
      }
    }

    verify();
  }, [searchParams, refreshProfile]);

  if (status === "verifying") {
    return (
      <div className="py-16 text-center">
        <div className="text-3xl mb-4 animate-pulse">&#9889;</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Verifying your payment...
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This will only take a moment.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="text-3xl mb-4">&#9888;</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          We couldn&apos;t verify your payment. If you were charged, please
          contact support and we&apos;ll sort it out.
        </p>
        <Link
          href="/pricing"
          className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Back to Pricing
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16 text-center max-w-md mx-auto">
      <div className="text-4xl mb-4">&#127881;</div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Welcome to Pro!
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
        All 12 weeks are now unlocked{email ? ` for ${email}` : ""}.
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
        You now have lifetime access to the complete course, including all
        future updates.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/week/5"
          className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Start Week 5 &rarr;
        </Link>
        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back to Overview
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center">
          <div className="text-3xl mb-4 animate-pulse">&#9889;</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Verifying your payment...
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This will only take a moment.
          </p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
