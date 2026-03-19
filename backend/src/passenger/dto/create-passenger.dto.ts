import { IsNotEmpty, IsString, MaxLength, IsEmail, IsOptional, IsDateString } from 'class-validator';
import { IPassenger } from 'src/passenger/types/passenger.interface';

export class CreatePassengerDto implements IPassenger {
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
  @MaxLength(20)
  passport_number: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsNotEmpty()
  @IsDateString()
  date_of_birth: string;
}
