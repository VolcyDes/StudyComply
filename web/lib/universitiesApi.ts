import { API_BASE_URL } from "./config";

export type PublicUniversity = {
  slug: string;
  name: string;
  countryCode: string;
  city?: string | null;
  websiteUrl?: string | null;
};

export type UniversityRequirement = {
  id: string;
  title: string;
  description?: string | null;
  kind: "REQUIRED" | "INFO";
  priority: "LOW" | "MEDIUM" | "HIGH";
  stayMode: "SHORT" | "LONG" | "ANY";
  dueDate?: string | null;
  dueDaysBefore?: number | null;
  computedDueDate?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

export async function searchUniversities(query: string): Promise<PublicUniversity[]> {
  const q = query.trim();
  const url = `${API_BASE_URL}/universities${q ? `?query=${encodeURIComponent(q)}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`searchUniversities failed: ${res.status}`);
  return res.json();
}

export async function getUniversity(slug: string): Promise<PublicUniversity> {
  const res = await fetch(`${API_BASE_URL}/universities/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`getUniversity failed: ${res.status}`);
  return res.json();
}

export async function getUniversityRequirements(args: {
  slug: string;
  stayMode?: "SHORT" | "LONG" | "ANY";
  projectStart?: string;
}): Promise<UniversityRequirement[]> {
  const { slug, stayMode = "ANY", projectStart } = args;

  const params = new URLSearchParams();
  if (stayMode) params.set("stayMode", stayMode);
  if (projectStart) params.set("projectStart", projectStart);

  const url = `${API_BASE_URL}/universities/${encodeURIComponent(slug)}/requirements?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`getUniversityRequirements failed: ${res.status}`);
  return res.json();
}
