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
    status: "FREE" | "VISA_REQUIRED" | "AUTH_REQUIRED" | "VISA_FREE";
    basedOn: string;
    message: string;
    meta?: Record<string, any>;
    requiredDocuments?: RequiredDoc[];
};
export declare function evaluateEntry(destination: DestinationZone, passports: string[], stayBucket?: StayBucket): EntryResult;
