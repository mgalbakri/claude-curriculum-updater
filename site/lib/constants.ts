// Formspree
export const FORMSPREE_ID = "mgolkeaa";

// localStorage keys
export const LS_EMAIL_SUBSCRIBED = "ccm-email-subscribed";
export const LS_EMAIL_DISMISSED = "ccm-email-banner-dismissed";
export const LS_EMAIL_GATE_SKIPPED = "ccm-email-gate-skipped";
export const LS_EXIT_INTENT_SHOWN = "ccm-exit-intent-shown"; // sessionStorage
export const LS_PREMIUM_TOKEN = "ccm-premium-token";

// Course structure
// ALL weeks free while Lemon Squeezy account is under verification.
// To re-enable paid tiers, restore FREE_WEEKS to [1,2,3,4] and
// PREMIUM_WEEKS to [5,6,7,8,9,10,11,12].
export const FREE_WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const PREMIUM_WEEKS = [] as const;
export const TOTAL_WEEKS = 12;
export const COURSE_IS_FREE = true; // flip to false when LS is approved

// Pricing (dormant while COURSE_IS_FREE)
export const PRICE_AMOUNT = 4900; // cents
export const PRICE_DISPLAY = "$49";

// Lead magnet
export const CHEAT_SHEET_PATH = "/ai-coding-cheat-sheet.pdf";
