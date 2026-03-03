import {
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsArray
} from 'class-validator';
import type { IAircraft } from 'src/aircraft/types/aircraft.interface';
import type { IAircraftSeat } from 'src/seat/types/seat.interface';
import IsValidSeats from 'src/aircraft/validators/is-valid-seats.validator';

export class PatchAircraftDto implements Partial<IAircraft> {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  registration_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  manufacturer?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2030)
  year?: number;

  @IsOptional()
  @IsArray()
  @IsValidSeats()
  seats?: IAircraftSeat[];

  @IsOptional()
  @IsInt()
  @Min(1)
  airline_id?: number;
}
