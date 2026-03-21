-- CreateEnum
CREATE TYPE "IntegrationSource" AS ENUM ('AZURE', 'AWS', 'GCP');

-- CreateEnum
CREATE TYPE "IntegrationFileExtension" AS ENUM ('XLSX', 'XLS', 'JSON');

-- CreateEnum
CREATE TYPE "SyncRunStatus" AS ENUM ('STARTED', 'PARTIALLY_COMPLETED', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "source" "IntegrationSource" NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceToken" TEXT NOT NULL,
    "sourceFileExtension" "IntegrationFileExtension" NOT NULL,
    "tillaToTenantMapping" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seaport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "portName" TEXT NOT NULL,
    "locode" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "countryIso" TEXT,
    "timezoneOlson" TEXT,

    CONSTRAINT "Seaport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "status" "SyncRunStatus" NOT NULL,
    "totalRecords" INTEGER NOT NULL,
    "totalRecordsProcessed" INTEGER NOT NULL,
    "totalRecordsFailed" INTEGER NOT NULL,
    "totalRecordsSkipped" INTEGER NOT NULL,
    "eTag" TEXT,
    "lastModified" TIMESTAMP(3),
    "contentLength" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tenant_id_idx" ON "Tenant"("id");

-- CreateIndex
CREATE INDEX "Integration_tenantId_isActive_idx" ON "Integration"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "Seaport_tenantId_integrationId_id_idx" ON "Seaport"("tenantId", "integrationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Seaport_tenantId_locode_key" ON "Seaport"("tenantId", "locode");

-- CreateIndex
CREATE INDEX "SyncRun_tenantId_integrationId_startedAt_idx" ON "SyncRun"("tenantId", "integrationId", "startedAt" DESC);

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seaport" ADD CONSTRAINT "Seaport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seaport" ADD CONSTRAINT "Seaport_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncRun" ADD CONSTRAINT "SyncRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncRun" ADD CONSTRAINT "SyncRun_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
