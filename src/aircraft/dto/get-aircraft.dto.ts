import { IsInt, Min, Max, IsOptional, IsString, MaxLength, IsNotEmpty, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { IEntityFields, IGetAllAircraft } from '../types/get-all-aircraft.interface';

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
  order_by: keyof IEntityFields = 'name';

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
  @Min(1)
  total_seats_from?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(2)
  total_seats_to?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  airline_id?: number;
}
