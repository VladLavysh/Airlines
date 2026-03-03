import {
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { IAircraft } from '../types/aircraft.interface';
import type { IAircraftSeat } from 'src/seat/types/seat.interface';

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
  seats?: IAircraftSeat[];

  @IsOptional()
  @IsInt()
  @Min(1)
  airline_id?: number;
}
