import {
  IsInt,
  IsNumber,
  IsString,
  Min,
  Max,
  Matches,
  IsIn,
} from 'class-validator';

export class CreateProfileDto {
  @IsInt({ message: 'Tuổi phải là số nguyên' })
  @Min(10, { message: 'Tuổi tối thiểu là 10' })
  @Max(120, { message: 'Tuổi tối đa là 120' })
  age: number;

  @IsString()
  @IsIn(['MALE', 'FEMALE', 'OTHER'], { message: 'Giới tính không hợp lệ' })
  gender: string;

  @IsNumber({}, { message: 'Chiều cao phải là số' })
  @Min(50, { message: 'Chiều cao tối thiểu là 50 cm' })
  @Max(250, { message: 'Chiều cao tối đa là 250 cm' })
  heightCm: number;

  @IsNumber({}, { message: 'Cân nặng phải là số' })
  @Min(20, { message: 'Cân nặng tối thiểu là 20 kg' })
  @Max(300, { message: 'Cân nặng tối đa là 300 kg' })
  weightKg: number;

  @IsString()
  @IsIn(['SEDENTARY', 'LIGHT', 'MODERATE', 'VERY_ACTIVE'], {
    message: 'Mức độ vận động không hợp lệ',
  })
  activityLevel: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Giờ thức dậy phải có định dạng HH:mm',
  })
  wakeTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Giờ đi ngủ phải có định dạng HH:mm',
  })
  sleepTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Giờ bắt đầu làm việc phải có định dạng HH:mm',
  })
  workStartTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Giờ tan ca phải có định dạng HH:mm',
  })
  workEndTime: string;
}
