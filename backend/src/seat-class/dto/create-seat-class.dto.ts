import { IsNotEmpty, IsString, MaxLength, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { ISeatClass } from 'src/seat-class/types/seat-class.interface';

export class CreateSeatClassDto implements ISeatClass {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  name: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price_multiplier: number;
}
