import { API_BASE_URL } from "./config";

/**
 * Prod auth: HttpOnly cookie (sc_token)
 * -> Always use credentials: "include"
 */
export async function authFetch(
  path: string,
  init?: RequestInit
): Promise<{ res: Response; data: any }> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    // keep any incoming headers
    headers: { ...(init?.headers ?? {}) },
    credentials: "include",
  });

  const raw = await res.clone().text().catch(() => "");
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw || null;
  }

  return { res, data };
}
