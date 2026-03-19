import { IsNotEmpty, IsString, MaxLength, IsEmail, IsEnum } from 'class-validator';
import { IUser, UserRole } from 'src/user/types/user.interface';
import { IsStrongPassword } from 'src/common/validators/is-strong-password.validator';

export class CreateUserDto implements Omit<IUser, 'deleted_at'> {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  last_name: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  @MaxLength(64)
  password: string;
}
