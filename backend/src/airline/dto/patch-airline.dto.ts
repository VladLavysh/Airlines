import { IsOptional, IsString, MaxLength, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { IAirline } from 'src/airline/types/airline.interface';

export class PatchAirlineDto implements Partial<IAirline> {
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

  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price_multiplier?: number;
}
