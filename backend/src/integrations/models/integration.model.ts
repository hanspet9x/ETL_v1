import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

import {
  IntegrationFileExtension,
  IntegrationSource,
} from './integration.enums';

@ObjectType()
export class IntegrationModel {
  @Field(() => ID)
  id!: string;

  @Field(() => IntegrationSource)
  source!: IntegrationSource;

  @Field()
  sourceUrl!: string;

  @Field(() => IntegrationFileExtension)
  sourceFileExtension!: IntegrationFileExtension;

  @Field()
  isActive!: boolean;

  @Field()
  tenantId!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
