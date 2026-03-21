//seed tenants and integrations
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { IntegrationSource, IntegrationFileExtension } from '../generated/prisma/client';
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
    
    const tenantId = 'cmn0tbf7t0000cdsfgoerqe6w';
    const tenant =await prisma.tenant.upsert({
        where: {
            id: tenantId,
        },
        update: {
            name: 'Tilla',
        },
        create: {
            id: tenantId,
            name: 'Tilla',
        },
    });
    const integraitonData = {
        source: IntegrationSource.AZURE,
        sourceUrl: 'https://tillachallenge.blob.core.windows.net/challenge-data',
        sourceToken: '?sp=rl&st=2026-02-10T07:18:36Z&se=2026-04-01T15:33:36Z&spr=https&sv=2024-11-04&sr=c&sig=hWOx9eiybuxnOIIFwUqtNQF%2FMz5oyAwV8HXJWt6pYjM%3D',
        sourceFileExtension: IntegrationFileExtension.XLSX,
        tillaToTenantMapping: {
            'locode': 'unLocCode',
            'portName': 'portName',
            'latitude': 'latitude',
            'longitude': 'longitude',
            'countryIso': 'countryIso',
            'timezoneOlson': 'appTimeZone',
        },
        isActive: true,
        tenantId: tenant.id,
    }
    const integration = await prisma.integration.findFirst({
        where: {
            tenantId: tenant.id,
        },
    });
    await prisma.integration.upsert({   
        where: {
            id: integration?.id,
        },
        update: integraitonData,
        create: integraitonData,
    });
}

main().catch(console.error);