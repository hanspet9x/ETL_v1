import { registerEnumType } from '@nestjs/graphql';

export enum IntegrationSource {
  AZURE = 'AZURE',
  AWS = 'AWS',
  GCP = 'GCP',
}

export enum IntegrationFileExtension {
  XLSX = 'XLSX',
  XLS = 'XLS',
  JSON = 'JSON',
}

registerEnumType(IntegrationSource, {
  name: 'IntegrationSource',
});

registerEnumType(IntegrationFileExtension, {
  name: 'IntegrationFileExtension',
});

