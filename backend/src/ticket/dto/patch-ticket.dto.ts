import { IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';

export class PatchTicketDto {
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seat_id?: number;
}
