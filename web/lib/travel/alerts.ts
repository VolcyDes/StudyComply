export const ALERT_SOON_DAYS = 30;     // show alert banner / renewal
export const ALERT_URGENT_DAYS = 7;    // urgent (red)
export const DISMISS_DEFAULT_DAYS = 7; // snooze duration

export function parseISODateOnly(iso?: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function daysUntil(iso?: string | null): number | null {
  const d = parseISODateOnly(iso);
  if (!d) return null;
  const now = new Date();
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function fmtDate(iso?: string | null): string {
  const d = parseISODateOnly(iso);
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function alertPillClass(days: number) {
  if (days <= 7) return "bg-red-100 text-red-800 border-red-200";
  if (days <= 30) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-green-100 text-green-800 border-green-200";
}

export function todayISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
}

export function addDaysISODateOnly(days: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isDismissed(docId: string, dismissedMap: Record<string, string>): boolean {
  const until = dismissedMap?.[docId];
  if (!until) return false;
  return until >= todayISO();
}
