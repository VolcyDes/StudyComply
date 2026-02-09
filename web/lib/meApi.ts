export type Me = {
  user: {
    id: string;
    email: string;
    role: "USER" | "UNIVERSITY" | "ADMIN";
    universityId?: string | null;
  };
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export async function getMe(): Promise<Me> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const token = getToken();

  const res = await fetch(`${base}/api/v1/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  return res.json();
}
