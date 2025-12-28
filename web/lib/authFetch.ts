import { API_BASE_URL } from "./config";

export async function authFetch(
  path: string,
  init?: RequestInit
): Promise<{ res: Response; data: any }> {
  const t = localStorage.getItem("token");
  if (!t) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${t}`,
    },
  });

  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  return { res, data };
}
