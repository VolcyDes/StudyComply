export type DestinationZone = "SCHENGEN";

export type EntryResult =
  | {
      destination: DestinationZone;
      status: "FREE";
      basedOn: string;
      message: string;
    }
  | {
      destination: DestinationZone;
      status: "VISA_FREE";
      basedOn: string;
      maxStayDays: number;
      periodDays: number;
      etiasRequired: boolean;
      message: string;
    }
  | {
      destination: DestinationZone;
      status: "VISA_REQUIRED";
      basedOn: string;
      message: string;
    };
