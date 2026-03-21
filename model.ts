interface Tenant {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    integrations: Integration[];
    seaports: Seaport[];
    syncRuns: SyncRun[];
}

enum IntegrationSource {
    AZURE = "AZURE",
    AWS = "AWS",
    GCP = "GCP",
}

enum IntegrationFileExtension {
    XLSX = "XLSX",
    XLS = "XLS",
    JSON = "JSON",
}

interface Integration {
    id: string;
    source: IntegrationSource;
    sourceUrl: string;
    sourceToken: string;
    sourceFileExtension: IntegrationFileExtension;
    tillaToTenantMapping: Record<string, string>;
    isActive: boolean;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Seaport {
    id: string;
    tenantId: string;
    integrationId: string;
    portName: string;
    locode: string;
    latitude: string;
    longitude: string;
    countryIso?: string;
    timezoneOlson?: string;
}

enum SyncRunStatus {
    STARTED = "STARTED",
    PARTIALLY_COMPLETED = "PARTIALLY_COMPLETED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

interface SyncRun {
    id: string;
    tenantId: string;
    integrationId: string;
    status: SyncRunStatus;
    totalRecords: number;
    
    eTag: string;
    lastModified: Date;
    contentLength: string;

    totalRecordsProcessed: number;
    totalRecordsFailed: number;
    totalRecordsSkipped: number;
    startedAt: Date;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}