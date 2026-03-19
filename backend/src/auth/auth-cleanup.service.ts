import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthCleanupService {
  private readonly logger = new Logger(AuthCleanupService.name);

  constructor(private authRepository: AuthRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupRevokedTokens() {
    this.logger.log('Starting cleanup of revoked refresh tokens...');
    
    try {
      const deletedCount = await this.authRepository.deleteRevokedTokens();
      this.logger.log(`Successfully deleted ${deletedCount} revoked refresh tokens`);
    } catch (error) {
      this.logger.error('Failed to cleanup revoked tokens', error);
    }
  }
}
