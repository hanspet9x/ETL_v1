import { registerEnumType } from '@nestjs/graphql';

export enum SyncRunStatus {
  STARTED = 'STARTED',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(SyncRunStatus, {
  name: 'SyncRunStatus',
});

