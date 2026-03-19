import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { IAircraft } from 'src/aircraft/types/aircraft.interface';
import type { IAircraftSeat } from 'src/seat/types/seat.interface';
import IsValidSeats from 'src/aircraft/validators/is-valid-seats.validator';

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

  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price_multiplier: number = 1.00;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsValidSeats()
  seats: IAircraftSeat[]

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  airline_id: number;
}
