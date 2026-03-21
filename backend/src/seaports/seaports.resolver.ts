import { Args, Int, Query, Resolver } from '@nestjs/graphql';

import { SeaportConnectionModel } from './models/seaport-connection.model';
import { SeaportsService } from './seaports.service';

@Resolver(() => SeaportConnectionModel)
export class SeaportsResolver {
  constructor(private readonly seaportsService: SeaportsService) {}

  @Query(() => SeaportConnectionModel, { name: 'tenantSeaports' })
  tenantSeaports(
    @Args('tenantId', { type: () => String }) tenantId: string,
    @Args('integrationId', { type: () => String }) integrationId: string,
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 }) first: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
    @Args('before', { type: () => String, nullable: true }) before?: string,
  ) {
    return this.seaportsService.findPage({
      tenantId,
      integrationId,
      first,
      after,
      before,
    });
  }
}
