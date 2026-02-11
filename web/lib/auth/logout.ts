import { authFetch } from "@/lib/authFetch";

export async function logout() {
  const { res } = await authFetch("/api/v1/auth/logout", { method: "POST" });
  if (!res.ok) throw new Error("Logout failed");
}
