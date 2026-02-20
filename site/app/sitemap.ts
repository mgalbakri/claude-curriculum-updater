import type { MetadataRoute } from "next";
import { getAllWeeks, getAllAppendices } from "@/lib/parse-curriculum";

const BASE_URL = "https://agentcodeacademy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const weeks = getAllWeeks();
  const appendices = getAllAppendices();

  const weekPages = weeks.map((week) => ({
    url: `${BASE_URL}/week/${week.number}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const appendixPages = appendices.map((appendix) => ({
    url: `${BASE_URL}/appendix/${appendix.letter.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/profile`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/certificate`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...weekPages,
    ...appendixPages,
  ];
}
