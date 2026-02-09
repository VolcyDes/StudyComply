export type LoginRole = "STUDENT" | "UNIVERSITY";

const KEY = "sc_login_role";

export function getLoginRole(): LoginRole {
  if (typeof window === "undefined") return "STUDENT";
  const v = window.localStorage.getItem(KEY);
  return v === "UNIVERSITY" ? "UNIVERSITY" : "STUDENT";
}

export function setLoginRole(role: LoginRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, role);
}
