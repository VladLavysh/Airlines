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
import { IGetAllSeatClasses, SEAT_CLASS_ORDER_BY_FIELDS } from 'src/seat-class/types/get-all-seat-classes.interface';

export class GetSeatClassesQueryDto implements IGetAllSeatClasses {
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
  @IsIn(SEAT_CLASS_ORDER_BY_FIELDS)
  order_by: (typeof SEAT_CLASS_ORDER_BY_FIELDS)[number] = 'name';

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string;

  @IsOptional()
  @IsString()
  price_multiplier?: string;
}
