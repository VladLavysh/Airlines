import { IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';
import { IRoute } from 'src/route/types/route.interface';

export class PatchRouteDto implements Partial<IRoute> {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  departure_airport?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  arrival_airport?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  distanceKM?: number;
}
