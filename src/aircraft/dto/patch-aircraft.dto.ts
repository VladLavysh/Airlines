import {
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { IAircraft } from '../types/aircraft.interface';

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
  @IsInt()
  @Min(1)
  total_seats?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  airline_id?: number;
}
