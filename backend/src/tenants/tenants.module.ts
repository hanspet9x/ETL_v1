import { Module } from '@nestjs/common';

import { TenantsResolver } from './tenants.resolver';
import { TenantsService } from './tenants.service';

@Module({
  providers: [TenantsResolver, TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
