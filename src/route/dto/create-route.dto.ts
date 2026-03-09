import { IsNotEmpty, IsString, MaxLength, IsInt, Min } from 'class-validator';
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
}
