import { Module } from '@nestjs/common';

import { CloudStorageModule } from '../cloudStorage/cloudStorage.module';
import { EtlService } from './etl.service';

@Module({
  imports: [CloudStorageModule],
  providers: [EtlService],
  exports: [EtlService],
})
export class EtlModule {}
