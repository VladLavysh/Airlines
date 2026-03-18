import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UserService } from 'src/user/user.service';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserRole } from 'src/user/types/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('No user found with this email');
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const refreshExpiration = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRATION');
    const expiresAt = this.calculateExpirationDate(refreshExpiration);

    await this.authRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        ...user,
        role: user.role as UserRole,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userService.findUserByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userService.createUser({
      ...registerDto,
      role: UserRole.USER,
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const refreshExpiration = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRATION');
    const expiresAt = this.calculateExpirationDate(refreshExpiration);

    await this.authRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        ...user,
        role: user.role as UserRole,
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    const tokenRecords = await this.authRepository.findRefreshToken(refreshToken);

    if (tokenRecords.length === 0) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenRecord = tokenRecords[0];

    if (tokenRecord.revoked_at) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (new Date() > new Date(tokenRecord.expires_at)) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (tokenRecord.user.deleted_at) {
      throw new UnauthorizedException('User account has been deleted');
    }

    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.authRepository.revokeRefreshToken(refreshToken);

    const user = {
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role as UserRole,
      first_name: tokenRecord.user.first_name,
      last_name: tokenRecord.user.last_name,
    };

    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    const refreshExpiration = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRATION');
    const expiresAt = this.calculateExpirationDate(refreshExpiration);

    await this.authRepository.createRefreshToken(user.id, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenRecords = await this.authRepository.findRefreshToken(refreshToken);

    if (tokenRecords.length === 0) {
      throw new BadRequestException('Invalid refresh token');
    }

    await this.authRepository.revokeRefreshToken(refreshToken);
  }

  private generateAccessToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const expiresIn = this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRATION');

    return this.jwtService.sign(payload, { secret, expiresIn } as any);
  }

  private generateRefreshToken(user: any): string {
    const payload = {
      sub: user.id,
    };

    const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const expiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRATION');

    return this.jwtService.sign(payload, { secret, expiresIn } as any);
  }

  private calculateExpirationDate(expiration: string): Date {
    const now = new Date();
    const match = expiration.match(/^(\d+)([smhd])$/);

    if (!match) {
      throw new Error('Invalid expiration format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        now.setSeconds(now.getSeconds() + value);
        break;
      case 'm':
        now.setMinutes(now.getMinutes() + value);
        break;
      case 'h':
        now.setHours(now.getHours() + value);
        break;
      case 'd':
        now.setDate(now.getDate() + value);
        break;
      default:
        throw new Error('Invalid expiration unit');
    }

    return now;
  }
}
