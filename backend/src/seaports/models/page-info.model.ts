import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageInfoModel {
  @Field({ nullable: true })
  startCursor!: string | null;

  @Field({ nullable: true })
  endCursor!: string | null;

  @Field()
  hasPreviousPage!: boolean;

  @Field()
  hasNextPage!: boolean;
}

