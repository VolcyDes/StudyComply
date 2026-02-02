import { MetaService } from './meta.service';
export declare class MetaController {
    private readonly meta;
    constructor(meta: MetaService);
    countries(): Promise<{
        name: string;
        code: string;
    }[]>;
    purposes(): Promise<{
        code: any;
        label: any;
    }[]>;
}
