import { IsOptional, IsString, MaxLength, IsEmail, MinLength, IsEnum } from 'class-validator';
import { IUser, UserRole } from 'src/user/types/user.interface';

export class PatchUserDto implements Partial<Omit<IUser, 'deleted_at'>> {
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  last_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password?: string;
}
