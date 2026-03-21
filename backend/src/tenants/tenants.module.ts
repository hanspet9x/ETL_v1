import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { TenantsResolver } from './tenants.resolver';
import { TenantsService } from './tenants.service';

@Module({
  imports: [PrismaModule],
  providers: [TenantsResolver, TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
