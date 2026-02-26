import { IsString, MaxLength } from 'class-validator';
import { IAirline } from '../types/airline.interface';

export class CreateAirlineDto implements IAirline {
  @IsString()
  @MaxLength(64)
  name: string;
  
  @IsString()
  @IsString()
  @MaxLength(3)
  iata_code: string;
  
  @IsString()
  @MaxLength(32)
  country: string;
}