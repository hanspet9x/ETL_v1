import { Injectable } from "@nestjs/common";


interface ITenantFile {
    tenantId: string;
    integrationId: string;
    startedAt: Date;
    totalRecords: number;
    tillaToTenantMapping: Record<string, string>;
    data: Record<string, any>[] | undefined;
}

interface ITenantTransformedRecords {
    data: Record<string, any>[],
    skippedRecordCount: Record<string, number>;
}


@Injectable()
export class EtlService {
    async run() {
        const files = await this.extract();
        const transformed = await this.transform(files);
        await this.load(transformed);
    }

    async extract(): Promise<ITenantFile[]> {
        //get active integrations
        // get tenant files only if etl or last modified is greater than the last sync run or content length is not equal to the last sync run
        // download file else record last fetch attmept
        // hit transformation

        return [];
    }

    async transform(files: ITenantFile[]): Promise<ITenantTransformedRecords[]> {
        // process each tenant file in parallel
        // get mappings 
        // check if column exist
        // read in data and normalize
        // check for mandatory fields
        // record skipped fields
        // check for duplicates using locode
        const skippedRecordCount: Record<string, number> = {};
        void files;
        void skippedRecordCount;
        return [];
    }

    async load(data: ITenantTransformedRecords[]): Promise<void> {
        // chunks data into 1000
        // get values from Prisma.join and prisma sql
        // perform batch upsert Insert into SEAPORT cols Value value ON CONFLICT of tenanid and locode do update set value = excluded.value where 
        // tenantid = excluded.tenantid and locode = excluded.locode
        // record failed records
        // record processed records.
        void data;
    }
}
