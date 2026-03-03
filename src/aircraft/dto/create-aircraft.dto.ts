import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import type { IAircraft } from 'src/aircraft/types/aircraft.interface';
import type { IAircraftSeat } from 'src/seat/types/seat.interface'

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
  @IsArray()
  seats: IAircraftSeat[]

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  airline_id: number;
}
