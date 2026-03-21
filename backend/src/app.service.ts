import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async getHello() {
    await this.prismaService.$queryRaw`SELECT 1`;

    return {
      message: 'NestJS backend is ready',
      port: this.configService.get<number>('app.port'),
      database: 'connected',
    };
  }
}
