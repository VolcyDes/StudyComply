export type DestinationZone = "SCHENGEN" | "UK" | "USA" | "CANADA";
export type StayBucket = "SHORT" | "SEMESTER" | "YEAR" | "MULTIYEAR";
export type RequiredDoc = {
    id: string;
    title: string;
    detail: string;
    renewable?: boolean;
    validityMonths?: number;
    whenToRenewMonthsBefore?: number;
    links?: {
        label: string;
        url: string;
    }[];
};
export type EntryResult = {
    destination: DestinationZone;
    status: "FREE";
    basedOn: string;
    message: string;
} | {
    destination: DestinationZone;
    status: "VISA_FREE";
    basedOn: string;
    maxStayDays: number;
    periodDays: number;
    etiasRequired: boolean;
    message: string;
} | {
    destination: DestinationZone;
    status: "VISA_REQUIRED";
    basedOn: string;
    message: string;
};
