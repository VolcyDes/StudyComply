import { authFetch } from "@/lib/authFetch";

export type UniversityRequirement = {
  id: string;
  title: string;
  description?: string | null;
  kind: "REQUIRED" | "INFO";
  priority: "LOW" | "MEDIUM" | "HIGH";
  stayMode: "SHORT" | "LONG" | "ANY";
  dueDate?: string | null;
  dueDaysBefore?: number | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function adminListRequirements(universityId: string) {
  const r = await authFetch(`/api/v1/admin/universities/${universityId}/requirements`);
  return (r as any).data as UniversityRequirement[];
}

export async function adminCreateRequirement(
  universityId: string,
  body: Partial<UniversityRequirement> & { title: string },
) {
  const r = await authFetch(`/api/v1/admin/universities/${universityId}/requirements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (r as any).data as UniversityRequirement;
}
