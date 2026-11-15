import { IsOptional, IsInt, Min } from 'class-validator';

export class IncrementQuantitativeDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;
}
