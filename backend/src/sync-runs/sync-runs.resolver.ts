import { Args, Query, Resolver } from '@nestjs/graphql';

import { SyncRunModel } from './models/sync-run.model';
import { SyncRunsService } from './sync-runs.service';

@Resolver(() => SyncRunModel)
export class SyncRunsResolver {
  constructor(private readonly syncRunsService: SyncRunsService) {}

  @Query(() => SyncRunModel, { name: 'tenantSyncRunReport', nullable: true })
  tenantSyncRunReport(
    @Args('tenantId', { type: () => String }) tenantId: string,
    @Args('integrationId', { type: () => String }) integrationId: string,
  ) {
    return this.syncRunsService.findLatestByTenantAndIntegration(tenantId, integrationId);
  }
}
