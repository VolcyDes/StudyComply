export type AuthFetchLike =
  | ((path: string, init?: RequestInit) => Promise<Response>)
  | ((path: string, init?: RequestInit) => Promise<{ res: Response; data: any }>);

export async function toResData(out: Response | { res: Response; data: any }) {
  if (out instanceof Response) {
    const res = out;
    const ct = res.headers.get("content-type") || "";
    let data: any = null;
    try {
      if (ct.includes("application/json")) data = await res.clone().json();
      else data = await res.clone().text();
    } catch {
      data = null;
    }
    return { res, data };
  }
  return out;
}

export async function toResOnly(authFetch: AuthFetchLike, path: string, init?: RequestInit): Promise<Response> {
  const out = await authFetch(path, init);
  return out instanceof Response ? out : out.res;
}

export function errMsg(data: any, fallback: string) {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object" && typeof (data as any).message === "string") return (data as any).message;
  try {
    const s = JSON.stringify(data ?? {});
    return s === "{}" ? fallback : s;
  } catch {
    return fallback;
  }
}
