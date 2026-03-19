import { IsInt, Min, Max, IsOptional, IsString, IsNotEmpty, MaxLength, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { IGetAllPassengers, PASSENGER_ORDER_BY_FIELDS } from 'src/passenger/types/get-all-passengers.interface';

export class GetPassengersQueryDto implements IGetAllPassengers {
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
  @IsIn(PASSENGER_ORDER_BY_FIELDS)
  order_by: (typeof PASSENGER_ORDER_BY_FIELDS)[number] = 'created_at';

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  last_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  passport_number?: string;
}
