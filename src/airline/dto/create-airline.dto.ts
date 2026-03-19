import { IsNotEmpty, IsString, MaxLength, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { IAirline } from 'src/airline/types/airline.interface';

export class CreateAirlineDto implements IAirline {
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(3)
  iata_code: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  country: string;

  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price_multiplier: number = 1.00;
}
