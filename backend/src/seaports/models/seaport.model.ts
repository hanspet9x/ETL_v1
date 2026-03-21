import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SeaportModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  tenantId!: string;

  @Field(() => String)
  integrationId!: string;

  @Field(() => String)
  portName!: string;

  @Field(() => String)
  locode!: string;

  @Field(() => String)
  latitude!: string;

  @Field(() => String)
  longitude!: string;

  @Field(() => String, { nullable: true })
  countryIso!: string | null;

  @Field(() => String, { nullable: true })
  timezoneOlson!: string | null;
}
