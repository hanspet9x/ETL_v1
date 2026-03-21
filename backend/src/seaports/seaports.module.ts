import { Module } from '@nestjs/common';

import { SeaportsResolver } from './seaports.resolver';
import { SeaportsService } from './seaports.service';

@Module({
  providers: [SeaportsResolver, SeaportsService],
  exports: [SeaportsService],
})
export class SeaportsModule {}
