"use client";

import { useState, useEffect } from "react";
import { LS_EMAIL_SUBSCRIBED, LS_EMAIL_GATE_SKIPPED } from "@/lib/constants";

export function useEmailStatus() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isGateSkipped, setIsGateSkipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscribed = localStorage.getItem(LS_EMAIL_SUBSCRIBED) === "1";
    const skipped = localStorage.getItem(LS_EMAIL_GATE_SKIPPED) === "1";
    requestAnimationFrame(() => {
      setIsSubscribed(subscribed);
      setIsGateSkipped(skipped);
      setIsLoading(false);
    });
  }, []);

  function markSubscribed() {
    localStorage.setItem(LS_EMAIL_SUBSCRIBED, "1");
    setIsSubscribed(true);
  }

  function markGateSkipped() {
    localStorage.setItem(LS_EMAIL_GATE_SKIPPED, "1");
    setIsGateSkipped(true);
  }

  return { isSubscribed, isGateSkipped, isLoading, markSubscribed, markGateSkipped };
}
