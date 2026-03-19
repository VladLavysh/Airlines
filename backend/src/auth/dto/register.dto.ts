import { IsNotEmpty, IsString, MaxLength, IsEmail } from 'class-validator';
import { IsStrongPassword } from 'src/common/validators/is-strong-password.validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

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
