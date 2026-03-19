import { IsNotEmpty, IsString, MaxLength, IsInt, Min, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { IRoute } from 'src/route/types/route.interface';

export class CreateRouteDto implements IRoute {
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  departure_airport: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  arrival_airport: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  distance_km: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  base_price: number;
}
