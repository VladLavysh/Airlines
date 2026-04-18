import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ParamsDTO {
  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @IsNotEmpty()
  dateFrom: string;

  @IsString()
  @IsNotEmpty()
  dateTo: string;

  @IsString()
  @IsNotEmpty()
  airline: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsEnum(['pending', 'confirmed', 'cancelled'])
  status: 'pending' | 'confirmed' | 'cancelled';
}

export class ResponseDTO {
  @IsEnum(['search', 'chat'])
  type: 'search' | 'chat';

  @IsString()
  message: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ParamsDTO)
  params?: ParamsDTO;

  @IsOptional()
  data?: any;
}
