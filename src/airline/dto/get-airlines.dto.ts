import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { IGetAllAirlines } from '../types/get-all-airlines.interface';

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

  @IsOptional()
  @IsString()
  search?: string;
}