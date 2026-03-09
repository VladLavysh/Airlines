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
import { IGetAllRoutes, ROUTE_ORDER_BY_FIELDS } from 'src/route/types/get-all-routes.interface';

export class GetRoutesQueryDto implements IGetAllRoutes {
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
  @IsIn(ROUTE_ORDER_BY_FIELDS)
  order_by: (typeof ROUTE_ORDER_BY_FIELDS)[number] = 'departure_airport';

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  @MaxLength(32)
  departure_airport?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  arrival_airport?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  distance_km?: number;
}
