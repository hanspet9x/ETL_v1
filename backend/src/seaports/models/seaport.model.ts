import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SeaportModel {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  integrationId!: string;

  @Field()
  portName!: string;

  @Field()
  locode!: string;

  @Field()
  latitude!: string;

  @Field()
  longitude!: string;

  @Field({ nullable: true })
  countryIso!: string | null;

  @Field({ nullable: true })
  timezoneOlson!: string | null;
}

