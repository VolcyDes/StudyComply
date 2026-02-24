export type TravelDestination = "SCHENGEN" | "UK" | "USA" | "CANADA";

export type TravelStatus =
  | "FREE"
  | "AUTH_REQUIRED"
  | "VISA_REQUIRED";

export type TravelRequirementResult = {
  destination: TravelDestination;
  status: TravelStatus;
  basedOn: string;   // ISO2 passport used
  message: string;
  meta?: Record<string, any>;
};
