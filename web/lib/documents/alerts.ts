export const DISMISSED_ALERTS_KEY = "sc_dismissed_alerts_v1";

export type DismissedAlertsMap = Record<string, boolean>;

export function readDismissedAlerts(): DismissedAlertsMap {
  try {
    const raw = localStorage.getItem(DISMISSED_ALERTS_KEY);
    return raw ? (JSON.parse(raw) as DismissedAlertsMap) : {};
  } catch {
    return {};
  }
}

export function writeDismissedAlerts(map: DismissedAlertsMap) {
  try {
    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(map ?? {}));
  } catch {
    // ignore
  }
}
