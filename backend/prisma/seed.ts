//seed tenants and integrations
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { IntegrationSource, IntegrationFileExtension } from '../generated/prisma/client';
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
    const tenants = await prisma.tenant.findMany();
    if (tenants.length > 0) {
        return;
    }
    const tenant =await prisma.tenant.create({
        data: {
            name: 'Tilla',
        },
    });
    await prisma.integration.create({   
        data: {
            source: IntegrationSource.AZURE,
            sourceUrl: 'https://tillachallenge.blob.core.windows.net/challenge-data',
            sourceToken: '?sp=rl&st=2026-02-10T07:18:36Z&se=2026-04-01T15:33:36Z&spr=https&sv=2024-11-04&sr=c&sig=hWOx9eiybuxnOIIFwUqtNQF%2FMz5oyAwV8HXJWt6pYjM%3D',
            sourceFileExtension: IntegrationFileExtension.XLSX,
            tillaToTenantMapping: {
                'locode': '',
                'portName': '',
                'latitude': '',
                'longitude': '',
                'countryIso': '',
                'timezoneOlson': '',
            },
            isActive: true,
            tenantId: tenant.id,
        },
    });
}

main().catch(console.error);