import { UseInterceptors } from '@nestjs/common';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor';

export function Idempotent() {
  return UseInterceptors(IdempotencyInterceptor);
}
