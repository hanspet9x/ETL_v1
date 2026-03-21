import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsResolver } from './integrations.resolver';
import { IntegrationsService } from './integrations.service';

@Module({
  imports: [PrismaModule],
  providers: [IntegrationsResolver, IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
