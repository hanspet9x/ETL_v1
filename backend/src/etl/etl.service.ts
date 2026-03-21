import { Injectable } from "@nestjs/common";
import { CloudStorageService } from "src/cloudStorage/cloudStorage.service";
import { IntegrationsService } from "src/integrations/integrations.service";
import { SyncRunsService } from "src/sync-runs/sync-runs.service";
import { SeaportsService } from "src/seaports/seaports.service";
import { Seaport, SyncRunStatus } from "generated/prisma/client";
import { uuid } from "src/utils/common";
import { getTenantAndIntegrationKey, splitTenantAndIntegrationKey } from "src/utils/keys";


interface ITenantFile {
    tenantId: string;
    integrationId: string;
    startedAt: Date;
    totalRecords: number;
    tillaToTenantMapping: Record<string, string>;
    data: Record<string, any>[] | undefined;
    etag?: string;
    lastModified?: Date;
    contentLength?: number;
}

interface ITenantTransformedRecords {
    seaports: Seaport[],
    skippedRecordCount: number;
    tenantId: string;
    integrationId: string;
}

interface ILoadResult {
    processedCount: number;
    failedCount: number;
    tenantId: string;
    integrationId: string;
    completedAt?: Date;
}

interface IETLResult {
    [tenantAndIntegrationKey: string]: {
        tenantId: string;
        integrationId: string;
        processedCount: number;
        failedCount: number;
        totalCount: number;
        skippedRecordCount: number;
        etag?: string;
        lastModified?: Date;
        contentLength?: number;
        startedAt?: Date;
        completedAt?: Date;
    }
}
@Injectable()
export class EtlService {
    constructor(
        private readonly cloudStorageService: CloudStorageService,
        private readonly integrationsService: IntegrationsService,
        private readonly syncRunsService: SyncRunsService,
        private readonly seaportsService: SeaportsService,
    ) { }
    async run() {
        console.log('Running ETL');
        const etlResult: IETLResult = {};
        //extract files
        const files = await this.extract();
        //report extraction;
        for (const file of files) {
            const tenantAndIntegrationKey = getTenantAndIntegrationKey(file.tenantId, file.integrationId);
            if(!etlResult[tenantAndIntegrationKey]) {
                etlResult[tenantAndIntegrationKey] = {
                    tenantId: file.tenantId,
                    integrationId: file.integrationId,
                    processedCount: 0,
                    failedCount: 0,
                    totalCount: 0,
                    skippedRecordCount: 0,
                    etag: file.etag ?? '',
                    lastModified: file.lastModified ?? undefined,
                    contentLength: file.contentLength ?? 0,
                    startedAt: file.startedAt
                };
            }
        }
        console.log('Files extracted', files);
        if(files.length === 0) {
            console.error('No files found to process');
            throw new Error('No files found to process');
        }
        const transformed = await this.transform(files);
        //report transformation;
        for (const record of transformed) {
            const tenantAndIntegrationKey = getTenantAndIntegrationKey(record.tenantId, record.integrationId);
            const tenantResult = etlResult[tenantAndIntegrationKey] || {};
            tenantResult.skippedRecordCount = record.skippedRecordCount;
            etlResult[tenantAndIntegrationKey] = tenantResult;
        }

        console.log('Transformed', transformed);
        const loadResults: ILoadResult[] = [];
        for (const record of transformed) {
            const loadResult = await this.load(record);
            loadResults.push(loadResult);
        }
        //report load;
        for (const loadResult of loadResults) {
            const tenantAndIntegrationKey = getTenantAndIntegrationKey(loadResult.tenantId, loadResult.integrationId);
            const tenantResult = etlResult[tenantAndIntegrationKey] || {};
            tenantResult.processedCount = loadResult.processedCount;
            tenantResult.failedCount = loadResult.failedCount;
            etlResult[tenantAndIntegrationKey] = tenantResult;
            tenantResult.completedAt = loadResult.completedAt;
        }
        
    }

    $normalizeString(value: string): string {
        return value?.trim() ?? '';
    }
    $normalizeCoordinates(value: number | string, type: 'latitude' | 'longitude'): number {
        let point: number = value ? typeof value === 'string' ? Number(value.trim()) : Number(value) : 0;
        if(type === 'latitude' && point >= -180 && point <= 180) return point;
        if(type === 'longitude' && point >= -90 && point <= 90) return point;
        return 0;
    }
    $normalizeCountryIso(value: string): string {
        const iso =  value?.trim() ?? '';
        if(iso.length === 2) return iso.toUpperCase();
        return '';
    }
    async extract(): Promise<ITenantFile[]> {
        //get active integrations
        const integrations = await this.integrationsService.findActiveIntegrations();
        const tenantFiles: ITenantFile[] = [];
        for (const integration of integrations) {
            const tenantFile: ITenantFile = {
                tenantId: integration.tenantId,
                integrationId: integration.id,
                startedAt: new Date(),
                totalRecords: 0,
                tillaToTenantMapping: integration.tillaToTenantMapping as Record<string, string>,
                data: [],
            };
            const lastSyncRun = await this.syncRunsService.findLatestByIntegration(integration.id);
            const file = await this.cloudStorageService.getObject({
                source: integration.source,
                sourceUrl: integration.sourceUrl,
                sourceToken: integration.sourceToken,
                sourceFileExtension: integration.sourceFileExtension,
                etag: lastSyncRun?.eTag ?? undefined,
                lastModified: lastSyncRun?.lastModified ?? undefined,
                contentLength: lastSyncRun?.contentLength ?? undefined,
            });
            if(!file?.data) {
                console.error('No data found for integration', integration.id);
                continue;
            };
            tenantFile.data = (file?.data ?? []) as unknown as Record<string, any>[];
            tenantFile.etag = file?.etag ?? undefined;
            tenantFile.lastModified = file?.lastModified ?? undefined;
            tenantFile.contentLength = file?.contentLength ?? undefined;
            tenantFiles.push(tenantFile);
        }

        return tenantFiles;
    }

    async transform(files: ITenantFile[]): Promise<ITenantTransformedRecords[]> {

        // process each tenant file in parallel
        const transformedRecords: ITenantTransformedRecords[] = [];
        for (const file of files) {
            const transformed: ITenantTransformedRecords = {
                seaports: [],
                skippedRecordCount: 0,
                tenantId: file.tenantId,
                integrationId: file.integrationId,
            };
            const mappings = file.tillaToTenantMapping;
            const customerRecords = file.data;
            //dedupe records
           if(customerRecords) {
            const seaports = customerRecords.reduce((acc, row) => {
                //getCustomer mapping for locode
                const customerLoCodeColumn = mappings['locode'];
                const locodeValue = row[customerLoCodeColumn];
                if(!locodeValue) {
                    transformed.skippedRecordCount++;
                    return acc;
                }
                let portNameValue = this.$normalizeString(row[mappings['portName']]);
                let latitudeValue = this.$normalizeCoordinates(row[mappings['latitude']], 'latitude');
                let longitudeValue = this.$normalizeCoordinates(row[mappings['longitude']], 'longitude');
                let countryIsoValue = this.$normalizeCountryIso(row[mappings['countryIso']]);
                let timezoneOlsonValue = this.$normalizeString(row[mappings['timezoneOlson']]);
                //skipped if mandatory fields are not present
                if(!portNameValue || !latitudeValue || !longitudeValue) {
                    transformed.skippedRecordCount++;
                    return acc;
                }
                //saved?
                if (acc[locodeValue]) {
                    //duplicates found for this tenant
                    //compare previously saved record with current record
                    portNameValue = acc[locodeValue].portName || portNameValue;
                    latitudeValue = acc[locodeValue].latitude || latitudeValue;
                    longitudeValue = acc[locodeValue].longitude || longitudeValue;
                    countryIsoValue = acc[locodeValue].countryIso || countryIsoValue;
                    timezoneOlsonValue = acc[locodeValue].timezoneOlson || timezoneOlsonValue;

                }
                const seaport: Seaport = {
                    tenantId: file.tenantId,
                    integrationId: file.integrationId,
                    portName: portNameValue,
                    locode: locodeValue,
                    latitude: latitudeValue,
                    longitude: longitudeValue,
                    countryIso: countryIsoValue,
                    timezoneOlson: timezoneOlsonValue,
                    id: uuid()
                }
                acc[locodeValue] = seaport;
                return acc;
            }, {} as Record<string, Seaport>);
            transformed.seaports = Object.values(seaports);
            transformedRecords.push(transformed);
           }
        }
        return transformedRecords;
    }

    $chunkData(transformedData: ITenantTransformedRecords, size: number): Seaport[][] {
        const chunks: Seaport[][] = [];
        for (let i = 0; i < transformedData.seaports.length; i += size) {
            chunks.push(transformedData.seaports.slice(i, i + size));
        }
        return chunks;
    }
    async load(data: ITenantTransformedRecords): Promise<ILoadResult> {
        // chunks data into 1000
        const chunks = this.$chunkData(data, 1000);
        //loop through tenantIntegrationsTrasformed records
        let processedCount = 0;
        let failedCount = 0;
        for (const chunk of chunks) {
            try {
                //record in seaport
                await this.seaportsService.upsertBatch(chunk);
                processedCount += chunk.length;
            } catch (error) {
                console.error('Error upserting seaports', error);
                failedCount += chunk.length;
            }
        }
        return {
            processedCount,
            failedCount,
            tenantId: data.tenantId,
            integrationId: data.integrationId,
            completedAt: new Date(),
        };
    }

    async report(etlResult: IETLResult): Promise<void> {
        //report load results
        console.log('ETL results', etlResult);
        //report to database
        for (const tenantAndIntegrationKey in etlResult) {
            const { tenantId, integrationId } = splitTenantAndIntegrationKey(tenantAndIntegrationKey);
            const tenantResult = etlResult[tenantAndIntegrationKey];
            const status = (() => {
                if(tenantResult.processedCount == 0) return SyncRunStatus.FAILED;
                if(tenantResult.processedCount > 0 && tenantResult.failedCount > 0) return SyncRunStatus.PARTIALLY_COMPLETED;
                return SyncRunStatus.COMPLETED;
            })()
            await this.syncRunsService.create({
                id: uuid(),
                tenantId,
                integrationId,
                status,
                totalRecords: tenantResult.totalCount,
                totalRecordsProcessed: tenantResult.processedCount,
                totalRecordsFailed: tenantResult.failedCount ?? 0,
                totalRecordsSkipped: tenantResult.skippedRecordCount ?? 0,
                eTag: tenantResult.etag ?? null,
                lastModified: tenantResult.lastModified ?? null,
                contentLength: tenantResult.contentLength ?? null,
                startedAt: tenantResult.startedAt ?? new Date(),
                completedAt: tenantResult.completedAt ?? new Date(),
                createdAt: tenantResult.startedAt ?? new Date(),
                updatedAt: tenantResult.completedAt ?? new Date(),
            });
        }
    }
}
