import { IsOptional, IsString, MaxLength } from 'class-validator';
import { IAirline } from '../types/airline.interface';

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
}