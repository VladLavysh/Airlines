import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      // Access Redis client through cache-manager-redis-yet
      const cacheStore: any = this.cacheManager;
      const redisClient = cacheStore.store?.client;
      
      if (!redisClient) {
        this.logger.warn('Redis client not available for pattern invalidation');
        return;
      }

      const keys = await redisClient.keys(pattern);
      
      if (keys.length > 0) {
        this.logger.log(`Found ${keys.length} keys matching pattern "${pattern}": ${keys.join(', ')}`);
        await Promise.all(keys.map((key: string) => this.cacheManager.del(key)));
        this.logger.log(`✓ Invalidated ${keys.length} cache keys`);
      } else {
        this.logger.warn(`No keys found matching pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Failed to invalidate cache pattern ${pattern}:`, error);
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        await this.invalidateByPattern(`*:${tag}:*`);
        await this.invalidateByPattern(`*:${tag}`);
      }
      this.logger.log(`Invalidated cache for tags: ${tags.join(', ')}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate cache tags:`, error);
    }
  }

  async invalidateBooking(bookingId?: number, userId?: number): Promise<void> {
    const patterns: string[] = [
      '*booking*',
    ];

    if (bookingId) {
      patterns.push(`*booking/${bookingId}*`);
    }

    if (userId) {
      patterns.push(`*user:${userId}*booking*`);
    }

    await Promise.all(patterns.map(pattern => this.invalidateByPattern(pattern)));
  }

  async invalidateTicket(ticketId?: number, bookingId?: number, flightId?: number): Promise<void> {
    const patterns: string[] = [
      '*ticket*',
    ];

    if (ticketId) {
      patterns.push(`*ticket/${ticketId}*`);
    }

    if (bookingId) {
      patterns.push(`*booking:${bookingId}*`);
      await this.invalidateBooking(bookingId);
    }

    if (flightId) {
      patterns.push(`*flight:${flightId}*`);
    }

    await Promise.all(patterns.map(pattern => this.invalidateByPattern(pattern)));
  }

  async invalidateFlight(flightId?: number, routeId?: number, airlineId?: number, aircraftId?: number): Promise<void> {
    const patterns: string[] = [
      '*flight*',
    ];

    if (flightId) {
      patterns.push(`*flight/${flightId}*`);
    }

    if (routeId) {
      patterns.push(`*route:${routeId}*`);
    }

    if (airlineId) {
      patterns.push(`*airline:${airlineId}*`);
    }

    if (aircraftId) {
      patterns.push(`*aircraft:${aircraftId}*`);
    }

    await Promise.all(patterns.map(pattern => this.invalidateByPattern(pattern)));
  }

  async invalidateAirline(airlineId?: number): Promise<void> {
    const patterns: string[] = [
      '*airline*',  // Match any key containing 'airline'
    ];

    if (airlineId) {
      patterns.push(`*airline/${airlineId}*`);
      patterns.push(`*airline:${airlineId}*`);
      // Flights use airlines, so invalidate flight cache too
      await this.invalidateFlight(undefined, undefined, airlineId);
    }

    await Promise.all(patterns.map(pattern => this.invalidateByPattern(pattern)));
  }

  async debugListAllKeys(): Promise<string[]> {
    try {
      const cacheStore: any = this.cacheManager;
      const redisClient = cacheStore.store?.client;
      
      if (!redisClient) {
        this.logger.warn('Redis client not available');
        return [];
      }

      const keys = await redisClient.keys('*');
      this.logger.log(`Total cache keys: ${keys.length}`);
      keys.forEach((key: string) => this.logger.log(`  - ${key}`));
      return keys;
    } catch (error) {
      this.logger.error('Failed to list cache keys:', error);
      return [];
    }
  }

  async invalidateAircraft(aircraftId?: number, airlineId?: number): Promise<void> {
    const patterns: string[] = [
      '*aircraft*',
    ];

    if (aircraftId) {
      patterns.push(`*aircraft/${aircraftId}*`);
      patterns.push(`*aircraft:${aircraftId}*`);
      // Seats and flights depend on aircraft
      await this.invalidateSeat(undefined, aircraftId);
      await this.invalidateFlight(undefined, undefined, undefined, aircraftId);
    }

    if (airlineId) {
      patterns.push(`*airline:${airlineId}*`);
    }

    await Promise.all(patterns.map(pattern => this.invalidateByPattern(pattern)));
  }

  async invalidateRoute(routeId?: number): Promise<void> {
    const patterns: string[] = [
      '*route*',
    ];

    if (routeId) {
      patterns.push(`*route/${routeId}*`);
      patterns.push(`*route:${routeId}*`);
      // Flights depend on routes
      await this.invalidateFlight(undefined, routeId);
    }

    await Promise.all(patterns.map(pattern => this.invalidateByPattern(pattern)));
  }

  async invalidateSeat(seatId?: number, aircraftId?: number): Promise<void> {
    const patterns: string[] = [
      '*seat*',
    ];

    if (seatId) {
      patterns.push(`*seat/${seatId}*`);
    }

    if (aircraftId) {
      patterns.push(`*aircraft:${aircraftId}*`);
    }

    await Promise.all(patterns.map(pattern => this.invalidateByPattern(pattern)));
  }

  async invalidateSeatClass(seatClassId?: number): Promise<void> {
    const patterns: string[] = [
      '*seat-class*',
    ];

    if (seatClassId) {
      patterns.push(`*seat-class/${seatClassId}*`);
      // Seats depend on seat classes
      patterns.push(`*seat-class:${seatClassId}*`);
    }

    await Promise.all(patterns.map(pattern => this.invalidateByPattern(pattern)));
  }

  async invalidatePassenger(passengerId?: number): Promise<void> {
    const patterns: string[] = [
      '*passenger*',
    ];

    if (passengerId) {
      patterns.push(`*passenger/${passengerId}*`);
    }

    await Promise.all(patterns.map(pattern => this.invalidateByPattern(pattern)));
  }

  async invalidateAll(): Promise<void> {
    try {
      const cacheStore: any = this.cacheManager;
      const redisClient = cacheStore.store?.client;
      
      if (redisClient) {
        await redisClient.flushDb();
        this.logger.log('Cleared entire cache');
      }
    } catch (error) {
      this.logger.error('Failed to clear cache:', error);
    }
  }
}
