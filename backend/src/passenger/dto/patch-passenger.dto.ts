import { IsOptional, IsString, MaxLength, IsEmail, IsDateString } from 'class-validator';
import { IPassenger } from 'src/passenger/types/passenger.interface';

export class PatchPassengerDto implements Partial<IPassenger> {
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
  @MaxLength(20)
  passport_number?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;
}
