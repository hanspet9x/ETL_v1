import { Module } from '@nestjs/common';

import { SyncRunsResolver } from './sync-runs.resolver';
import { SyncRunsService } from './sync-runs.service';

@Module({
  providers: [SyncRunsResolver, SyncRunsService],
  exports: [SyncRunsService],
})
export class SyncRunsModule {}
