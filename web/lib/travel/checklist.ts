export type ChecklistItem = {
  id: string;
  title: string;
  detail: string;
  status: "DONE" | "TODO" | "INFO";
  urgency?: "LOW" | "MEDIUM" | "HIGH";
  link?: string;
  canComplete?: boolean;
};

export function buildChecklist(args: {
  destinationIso2: string;
  passportChoice: string;
  travelResult: any | null;
  stayDays?: number;
}): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const res = args.travelResult;
  const stayDays = typeof args.stayDays === "number" ? args.stayDays : 0;
  const longStay = stayDays > 90;

  if (res?.status === "AUTH_REQUIRED") {
    const auth = res?.meta?.auth ? String(res.meta.auth) : "authorization";

    const id =
      auth === "ESTA" ? "esta" :
      auth === "ETA" || auth === "eTA" ? "eta" :
      "auth";

    items.push({
      id,
      title: `Get your ${auth}`,
      detail: res?.message || "You need an authorization before travelling.",
      status: "TODO",
      urgency: "HIGH",
      canComplete: true,
    });
  } else if (res?.status === "VISA_REQUIRED") {
    items.push({
      id: "visa",
      title: "Start your visa application",
      detail: res?.message || "A visa is required for this destination.",
      status: "TODO",
      urgency: "HIGH",
      canComplete: true,
    });
  } else if (res?.status === "FREE" || res?.status === "VISA_FREE") {
    items.push({
      id: "rule",
      title: "Travel rule for short stays",
      detail: res?.message || "You can travel for short stays under the current rules.",
      status: "INFO",
      urgency: "LOW",
    });
  } else {
    items.push({
      id: "rule",
      title: "Check travel requirements",
      detail: "We could not load a clear rule. Try refreshing.",
      status: "INFO",
      urgency: "MEDIUM",
    });
  }

  if (longStay) {
    items.push({
      id: "longstay",
      title: "Long stay (90+ days)",
      detail:
        "For stays longer than 90 days, you usually need a long-stay visa or residence permit. Short-stay rules (ETA/ESTA/eTA) may not apply.",
      status: "INFO",
      urgency: "MEDIUM",
      canComplete: true,
    });
  }

  items.push({
    id: "vault",
    title: "Store your documents",
    detail: "Add your visa/authorization/insurance documents to the vault and track expiry dates.",
    status: "INFO",
    urgency: "LOW",
    canComplete: true,
  });

  return items;
}
