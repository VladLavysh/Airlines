import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { IGetAllSeats } from '../types/get-all-seats.interface';

export class GetSeatsQueryDto implements IGetAllSeats {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(500)
  limit: number = 100;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  aircraft_id?: number;
}
