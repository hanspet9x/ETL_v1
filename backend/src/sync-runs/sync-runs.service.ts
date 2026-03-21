import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncRunsService {
  constructor(private readonly prismaService: PrismaService) {}

  findLatestByTenantAndIntegration(tenantId: string, integrationId: string) {
    return this.prismaService.syncRun.findFirst({
      where: {
        tenantId,
        integrationId,
      },
      orderBy: [
        {
          startedAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
    });
  }
}
