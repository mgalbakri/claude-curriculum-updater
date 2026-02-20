"use client";

import { useAuth } from "@/lib/auth-context";
import { LS_PREMIUM_TOKEN } from "@/lib/constants";
import { useState, useEffect } from "react";

export function usePremiumStatus() {
  const { isPremium: supabasePremium, isLoading: authLoading } = useAuth();
  const [localPremium, setLocalPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage fallback (for users who purchased without logging in)
    let premium = false;
    try {
      const token = localStorage.getItem(LS_PREMIUM_TOKEN);
      if (token) {
        const parsed = JSON.parse(atob(token));
        if (parsed.orderId || parsed.sessionId) {
          premium = true;
        }
      }
    } catch {
      // Invalid token — ignore
    }
    requestAnimationFrame(() => {
      setLocalPremium(premium);
      setIsLoading(false);
    });
  }, []);

  return {
    isPremium: supabasePremium || localPremium,
    isLoading: authLoading || isLoading,
  };
}
