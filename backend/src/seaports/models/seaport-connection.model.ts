import { Field, Int, ObjectType } from '@nestjs/graphql';

import { PageInfoModel } from './page-info.model';
import { SeaportModel } from './seaport.model';

@ObjectType()
export class SeaportConnectionModel {
  @Field(() => [SeaportModel])
  nodes!: SeaportModel[];

  @Field(() => PageInfoModel)
  pageInfo!: PageInfoModel;

  @Field(() => Int)
  count!: number;
}
