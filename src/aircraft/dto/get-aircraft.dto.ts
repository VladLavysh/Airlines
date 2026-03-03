import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
  IsEnum,
  IsIn, 
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IGetAllAircraft, AIRCRAFT_ORDER_BY_FIELDS } from '../types/get-all-aircraft.interface';

export class GetAircraftQueryDto implements IGetAllAircraft {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  offset: number = 0;

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsString()
  @IsIn(AIRCRAFT_ORDER_BY_FIELDS)
  order_by: (typeof AIRCRAFT_ORDER_BY_FIELDS)[number] = 'name';

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsEnum(['asc', 'desc'])
  @IsString()
  order: 'asc' | 'desc' = 'asc';

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
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  airline_id?: number;
}
