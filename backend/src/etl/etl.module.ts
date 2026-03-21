import { Module } from '@nestjs/common';
import { EtlService } from './etl.service';
import { CloudStorageModule } from "../cloudStorage/cloudStorage.module";
import { SyncRunsModule } from 'src/sync-runs/sync-runs.module';
import { IntegrationsModule } from 'src/integrations/integrations.module';

@Module({
    imports: [
        CloudStorageModule,
        IntegrationsModule,
        SyncRunsModule
    ],
    providers: [EtlService],
    exports: [EtlService],
})
export class EtlModule {}



