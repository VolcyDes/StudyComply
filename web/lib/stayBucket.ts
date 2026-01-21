export type StayBucket = "SHORT" | "SEMESTER" | "YEAR" | "MULTIYEAR";

export function stayDaysToBucket(stayDays?: number | null): StayBucket {
  if (!stayDays || stayDays <= 0) return "SHORT";
  if (stayDays <= 90) return "SHORT";
  if (stayDays <= 200) return "SEMESTER";
  if (stayDays <= 400) return "YEAR";
  return "MULTIYEAR";
}

export function stayBucketLabel(bucket: StayBucket): string {
  switch (bucket) {
    case "SHORT":
      return "Short stay (≤ 90 days)";
    case "SEMESTER":
      return "Semester (~ 4–6 months)";
    case "YEAR":
      return "Academic year (~ 8–12 months)";
    case "MULTIYEAR":
      return "Multi-year (2+ years)";
  }
}
