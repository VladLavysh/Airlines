import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { IGetAllAirlines, AIRLINE_ORDER_BY_FIELDS } from 'src/airline/types/get-all-airlines.interface';

export class GetAirlinesQueryDto implements IGetAllAirlines {
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
  @IsIn(AIRLINE_ORDER_BY_FIELDS)
  order_by: (typeof AIRLINE_ORDER_BY_FIELDS)[number] = 'name';

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  iata_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  country?: string;

  @IsOptional()
  @IsString()
  price_multiplier?: string;
}
