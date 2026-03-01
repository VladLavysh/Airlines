import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { IAircraft } from '../types/aircraft.interface';

export class CreateAircraftDto implements IAircraft {
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(16)
  registration_number: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  manufacturer: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1900)
  @Max(2030)
  year: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  total_seats: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  airline_id: number;
}
