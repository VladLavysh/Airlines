import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AuthCleanupService } from './auth-cleanup.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UserModule } from 'src/user/user.module';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    ScheduleModule.forRoot(),
    UserModule,
    DbModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, AuthCleanupService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
