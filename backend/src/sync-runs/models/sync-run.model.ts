import { Field, GraphQLISODateTime, ID, Int, ObjectType } from '@nestjs/graphql';

import { SyncRunStatus } from './sync-run.enums';

@ObjectType()
export class SyncRunModel {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  integrationId!: string;

  @Field(() => SyncRunStatus)
  status!: SyncRunStatus;

  @Field(() => Int)
  totalRecords!: number;

  @Field(() => Int)
  totalRecordsProcessed!: number;

  @Field(() => Int)
  totalRecordsFailed!: number;

  @Field(() => Int)
  totalRecordsSkipped!: number;

  @Field(() => GraphQLISODateTime)
  startedAt!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  completedAt!: Date | null;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
