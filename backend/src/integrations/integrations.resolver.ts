import { Args, Query, Resolver } from '@nestjs/graphql';

import { IntegrationModel } from './models/integration.model';
import { IntegrationsService } from './integrations.service';

@Resolver(() => IntegrationModel)
export class IntegrationsResolver {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Query(() => [IntegrationModel], { name: 'tenantActiveIntegrations' })
  tenantActiveIntegrations(@Args('tenantId', { type: () => String }) tenantId: string) {
    return this.integrationsService.findActiveByTenant(tenantId);
  }
}
