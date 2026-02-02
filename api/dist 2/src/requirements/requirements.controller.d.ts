import { RequirementsService } from './requirements.service';
import { PassportsService } from "../passports/passports.service";
export declare class RequirementsController {
    private readonly reqs;
    private readonly passportsService;
    constructor(reqs: RequirementsService, passportsService: PassportsService);
    compute(req: any): Promise<{
        passports: string[];
        project: null;
        required: never[];
        missing: never[];
        note: string;
    } | {
        passports: string[];
        project: {
            destinationCountry: string;
            purpose: string;
            startDate: Date;
            endDate: Date;
            durationDays: number;
        };
        required: {
            id: string;
            title: string;
            passportCountry: string;
            requiredType: string;
            notes: string | null;
            minDays: number | null;
            maxDays: number | null;
        }[];
        missing: {
            id: string;
            title: string;
            passportCountry: string;
            requiredType: string;
            notes: string | null;
            minDays: number | null;
            maxDays: number | null;
        }[];
        note?: undefined;
    }>;
    travel(req: any, destination?: string, passport?: string, stayBucket?: string): Promise<import("./travel/engine").EntryResult>;
}
