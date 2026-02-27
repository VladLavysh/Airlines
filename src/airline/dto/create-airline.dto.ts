import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IAirline } from '../types/airline.interface';

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
}
