import type { UserDocument } from "./types";

export async function fetchUserDocumentsWith(
  authFetch: (path: string, init?: RequestInit) => Promise<Response>
): Promise<UserDocument[]> {
  const res = await authFetch("/api/v1/documents", { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch documents (${res.status}): ${text}`);
  }
  const data = await res.json();
  // Support multiple shapes: array or {items: []}
  if (Array.isArray(data)) return data as UserDocument[];
  if (data && Array.isArray((data as any).items)) return (data as any).items as UserDocument[];
  return [];
}

export function documentsTypeSet(docs: UserDocument[]): Set<string> {
  return new Set((docs ?? []).map((d) => d.type).filter(Boolean));
}
