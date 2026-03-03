import { IsOptional, IsString, MaxLength, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { ISeatClass } from '../types/seat-class.interface';

export class PatchSeatClassDto implements Partial<ISeatClass> {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string;

  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price_multiplier?: number;
}
