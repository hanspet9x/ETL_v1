import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { SeaportsResolver } from './seaports.resolver';
import { SeaportsService } from './seaports.service';

@Module({
  imports: [PrismaModule],
  providers: [SeaportsResolver, SeaportsService],
  exports: [SeaportsService],
})
export class SeaportsModule {}
