import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageInfoModel {
  @Field(() => String, { nullable: true })
  startCursor!: string | null;

  @Field(() => String, { nullable: true })
  endCursor!: string | null;

  @Field(() => Boolean)
  hasPreviousPage!: boolean;

  @Field(() => Boolean)
  hasNextPage!: boolean;
}
