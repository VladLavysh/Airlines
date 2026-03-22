import { IsOptional, IsString, MaxLength, IsInt, Min, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { IRoute } from 'src/route/types/route.interface';

export class PatchRouteDto implements Partial<IRoute> {
  @IsOptional()
  @IsString()
  @MaxLength(3)
  departure_airport?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  arrival_airport?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  distance_km?: number;

  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  base_price?: number;
}
