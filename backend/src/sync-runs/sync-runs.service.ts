import { Inject, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { SyncRun } from '../../generated/prisma/client';

@Injectable()
export class SyncRunsService {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

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
  findLatestByIntegration(integrationId: string) {
    return this.prismaService.syncRun.findFirst({
      where: {
        integrationId,
      },
      orderBy: [
        {
          startedAt: 'desc',
        },
      ],
    });
  }
  create(syncRun: SyncRun) {
    return this.prismaService.syncRun.create({
      data: syncRun,
    });
  }
}
