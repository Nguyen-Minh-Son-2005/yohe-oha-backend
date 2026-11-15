import { IsOptional, IsDateString } from 'class-validator';

export class CheckTaskDto {
  @IsOptional()
  @IsDateString({}, { message: 'clientTime phải là định dạng ISO timestamp' })
  clientTime?: string;
}
