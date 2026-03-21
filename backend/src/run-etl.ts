import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { EtlModule } from './etl/etl.module';
import { EtlService } from './etl/etl.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(EtlModule);
  const etlService = app.get(EtlService);
  await etlService.run();
}

void bootstrap();
