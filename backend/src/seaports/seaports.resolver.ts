import { Args, Int, Query, Resolver } from '@nestjs/graphql';

import { SeaportConnectionModel } from './models/seaport-connection.model';
import { SeaportsService } from './seaports.service';

@Resolver(() => SeaportConnectionModel)
export class SeaportsResolver {
  constructor(private readonly seaportsService: SeaportsService) {}

  @Query(() => SeaportConnectionModel, { name: 'tenantSeaports' })
  tenantSeaports(
    @Args('tenantId') tenantId: string,
    @Args('integrationId') integrationId: string,
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 }) first: number,
    @Args('after', { nullable: true }) after?: string,
    @Args('before', { nullable: true }) before?: string,
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
