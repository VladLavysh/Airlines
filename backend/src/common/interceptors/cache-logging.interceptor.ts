import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class CacheLoggingInterceptor extends CacheInterceptor {
  private readonly logger = new Logger(CacheLoggingInterceptor.name);

  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    reflector: Reflector,
  ) {
    super(cacheManager, reflector);
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const key = this.trackBy(context);

    if (key) {
      const cachedValue = await this.cacheManager.get(key);
      this.logger.log(`Cache ${cachedValue === undefined ? 'MISS' : 'HIT'}: ${key}`);
    }

    return super.intercept(context, next);
  }
}
