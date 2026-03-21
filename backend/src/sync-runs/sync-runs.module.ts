import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { SyncRunsResolver } from './sync-runs.resolver';
import { SyncRunsService } from './sync-runs.service';

@Module({
  imports: [PrismaModule],
  providers: [SyncRunsResolver, SyncRunsService],
  exports: [SyncRunsService],
})
export class SyncRunsModule {}
