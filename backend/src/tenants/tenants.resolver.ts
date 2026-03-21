import { Query, Resolver } from '@nestjs/graphql';

import { TenantModel } from './models/tenant.model';
import { TenantsService } from './tenants.service';

@Resolver(() => TenantModel)
export class TenantsResolver {
  constructor(private readonly tenantsService: TenantsService) {}

  @Query(() => [TenantModel], { name: 'tenants' })
  tenants() {
    return this.tenantsService.findAll();
  }
}
