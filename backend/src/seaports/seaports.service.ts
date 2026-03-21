import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type SeaportPageParams = {
  tenantId: string;
  integrationId: string;
  first: number;
  after?: string | null;
  before?: string | null;
};

@Injectable()
export class SeaportsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findPage({ tenantId, integrationId, first, after, before }: SeaportPageParams) {
    const pageSize = Math.max(1, Math.min(first, 20));
    const where = {
      tenantId,
      integrationId,
    };

    if (before) {
      const rows = await this.prismaService.seaport.findMany({
        where: {
          ...where,
          id: {
            lt: before,
          },
        },
        orderBy: {
          id: 'desc',
        },
        take: pageSize + 1,
      });

      const hasPreviousPage = rows.length > pageSize;
      const nodes = rows.slice(0, pageSize).reverse();
      const startCursor = nodes[0]?.id ?? null;
      const endCursor = nodes.at(-1)?.id ?? null;

      const hasNextPage = before !== null;

      return {
        nodes,
        count: nodes.length,
        pageInfo: {
          startCursor,
          endCursor,
          hasPreviousPage,
          hasNextPage,
        },
      };
    }

    const rows = await this.prismaService.seaport.findMany({
      where: {
        ...where,
        ...(after
          ? {
              id: {
                gt: after,
              },
            }
          : {}),
      },
      orderBy: {
        id: 'asc',
      },
      take: pageSize + 1,
    });

    const hasNextPage = rows.length > pageSize;
    const nodes = rows.slice(0, pageSize);
    const startCursor = nodes[0]?.id ?? null;
    const endCursor = nodes.at(-1)?.id ?? null;
    const hasPreviousPage = Boolean(after);

    return {
      nodes,
      count: nodes.length,
      pageInfo: {
        startCursor,
        endCursor,
        hasPreviousPage,
        hasNextPage,
      },
    };
  }
}
