export interface AffiliateTool {
  name: string;
  description: string;
  href: string;
  category: string;
  relevantWeeks: number[];
}

/**
 * Tool recommendations with affiliate URLs where applicable.
 * Update `href` with actual affiliate links once partnerships are active.
 */
export const affiliateTools: AffiliateTool[] = [
  {
    name: "Claude Pro / Max",
    description:
      "The AI assistant powering Claude Code. Pro or Max subscription recommended for full course experience.",
    href: "https://www.anthropic.com/claude",
    category: "AI",
    relevantWeeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    name: "Anthropic API",
    description:
      "Build custom integrations and extend Claude Code with the API. Essential for agent development.",
    href: "https://console.anthropic.com/",
    category: "AI",
    relevantWeeks: [6, 7, 8, 9, 10, 11, 12],
  },
  {
    name: "Cursor IDE",
    description:
      "AI-native code editor with deep Claude Code integration. Great for pair-programming with AI.",
    href: "https://www.cursor.com/",
    category: "Editor",
    relevantWeeks: [1, 2, 3, 4, 5, 6],
  },
  {
    name: "VS Code",
    description:
      "Industry-standard editor. Use with the Claude Code CLI extension for the best experience.",
    href: "https://code.visualstudio.com/",
    category: "Editor",
    relevantWeeks: [1, 2, 3, 4, 5, 6],
  },
  {
    name: "GitHub",
    description:
      "Host your projects and collaborate. Essential for version control and CI/CD pipelines.",
    href: "https://github.com/",
    category: "Platform",
    relevantWeeks: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    name: "Vercel",
    description:
      "Deploy your projects instantly. Works perfectly with Next.js for production-ready hosting.",
    href: "https://vercel.com/",
    category: "Platform",
    relevantWeeks: [4, 5, 6, 7, 8, 11, 12],
  },
  {
    name: "Supabase",
    description:
      "Open-source Firebase alternative with Postgres. Perfect for auth, databases, and real-time features.",
    href: "https://supabase.com/",
    category: "Backend",
    relevantWeeks: [5, 6, 7, 8, 9],
  },
  {
    name: "Lemon Squeezy",
    description:
      "Simple payment infrastructure for digital products. Handles checkout, taxes, and subscriptions.",
    href: "https://lemonsqueezy.com/",
    category: "Payments",
    relevantWeeks: [7, 8, 11, 12],
  },
];

/**
 * Get tools relevant to a specific week number.
 * Returns at most `limit` tools (default 2).
 */
export function getToolsForWeek(
  weekNumber: number,
  limit = 2
): AffiliateTool[] {
  return affiliateTools
    .filter((tool) => tool.relevantWeeks.includes(weekNumber))
    .slice(0, limit);
}
