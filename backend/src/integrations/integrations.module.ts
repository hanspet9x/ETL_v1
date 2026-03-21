import { Module } from '@nestjs/common';

import { IntegrationsResolver } from './integrations.resolver';
import { IntegrationsService } from './integrations.service';

@Module({
  providers: [IntegrationsResolver, IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
