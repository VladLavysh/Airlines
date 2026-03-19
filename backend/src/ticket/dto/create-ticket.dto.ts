import { IsNotEmpty, IsString, MaxLength, IsInt, Min, IsEmail, IsOptional, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketPassengerDto {
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

export class CreateTicketDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  booking_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  flight_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  seat_id: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateTicketPassengerDto)
  passenger: CreateTicketPassengerDto;
}
