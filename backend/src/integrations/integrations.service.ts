import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prismaService: PrismaService) {}

  findActiveByTenant(tenantId: string) {
    return this.prismaService.integration.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: [
        {
          source: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }
  findActiveIntegrations() {
    return this.prismaService.integration.findMany({
      where: {
        isActive: true,
      }
    });
  }
}
