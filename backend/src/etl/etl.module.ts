import { Module } from '@nestjs/common';
import { CloudStorageModule } from '../cloudStorage/cloudStorage.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SeaportsModule } from '../seaports/seaports.module';
import { SyncRunsModule } from '../sync-runs/sync-runs.module';
import { EtlService } from './etl.service';

@Module({
  imports: [CloudStorageModule, IntegrationsModule, SyncRunsModule, SeaportsModule],
  providers: [EtlService],
  exports: [EtlService],
})
export class EtlModule {}

