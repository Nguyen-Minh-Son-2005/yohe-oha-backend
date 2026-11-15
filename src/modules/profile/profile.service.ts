import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../../entities/user-profile.entity';
import { DailyTask } from '../../entities/daily-task.entity';
import { QuantitativeTask } from '../../entities/quantitative-task.entity';
import { DailyProgress } from '../../entities/daily-progress.entity';
import { SystemConfig } from '../../entities/system-config.entity';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(DailyTask)
    private taskRepository: Repository<DailyTask>,
    @InjectRepository(QuantitativeTask)
    private quantTaskRepository: Repository<QuantitativeTask>,
    @InjectRepository(DailyProgress)
    private progressRepository: Repository<DailyProgress>,
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
  ) {}

  async createOrUpdateProfile(userId: string, dto: CreateProfileDto) {
    // 1. Calculate BMI
    const heightM = dto.heightCm / 100;
    const bmi = parseFloat((dto.weightKg / (heightM * heightM)).toFixed(1));

    // 2. Calculate BMR (Mifflin-St Jeor)
    let bmr = 10 * dto.weightKg + 6.25 * dto.heightCm - 5 * dto.age;
    if (dto.gender === 'MALE') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    bmr = Math.round(bmr);

    // 3. Calculate TDEE
    const multipliers: Record<string, number> = {
      SEDENTARY: 1.2,
      LIGHT: 1.375,
      MODERATE: 1.55,
      VERY_ACTIVE: 1.725,
    };
    const tdee = Math.round(bmr * (multipliers[dto.activityLevel] || 1.2));

    // 4. Target Water (32.5 ml/kg, rounded to 100ml)
    const targetWaterMl = Math.min(
      3500,
      Math.max(1500, Math.round((dto.weightKg * 32.5) / 100) * 100),
    );

    // 5. Target Steps
    const stepGoals: Record<string, number> = {
      SEDENTARY: 6000,
      LIGHT: 8000,
      MODERATE: 10000,
      VERY_ACTIVE: 12000,
    };
    const targetSteps = stepGoals[dto.activityLevel] || 8000;

    // Save or update Profile
    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepository.create({ userId });
    }

    Object.assign(profile, {
      ...dto,
      bmi,
      bmr,
      tdee,
      targetWaterMl,
      targetSteps,
      healthMode: 'HEALTHY_NEUTRAL',
    });

    await this.profileRepository.save(profile);

    // 6. Generate Initial Daily Tasks & Quantitative Tasks for Today
    await this.initializeTodayTasks(userId, profile);

    return {
      message: 'Lưu hồ sơ cá nhân và khởi tạo hành trình thành công',
      profile: {
        ...profile,
        bmiClassification: this.classifyBmiAsia(bmi),
      },
    };
  }

  async getProfile(userId: string) {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) return null;
    return {
      ...profile,
      bmiClassification: this.classifyBmiAsia(profile.bmi),
    };
  }

  private classifyBmiAsia(bmi: number): { label: string; status: string } {
    if (bmi < 18.5) return { label: 'Thiếu cân', status: 'UNDERWEIGHT' };
    if (bmi < 23.0) return { label: 'Bình thường (Lý tưởng)', status: 'NORMAL' };
    if (bmi < 25.0) return { label: 'Thừa cân (Tiền béo phì)', status: 'OVERWEIGHT' };
    return { label: 'Béo phì', status: 'OBESE' };
  }

  private async initializeTodayTasks(userId: string, profile: UserProfile) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMin = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}`;

    // Read water step increment from system_configs
    const waterStepConfig = await this.configRepository.findOne({
      where: { configKey: 'water_step_ml' },
    });
    const waterStep = waterStepConfig ? parseInt(waterStepConfig.configValue, 10) : 200;

    // 1. Quantitative Tasks (Water + Steps)
    const existingQuant = await this.quantTaskRepository.find({
      where: { userId, taskDate: today },
    });

    if (existingQuant.length === 0) {
      const waterTask = this.quantTaskRepository.create({
        userId,
        taskDate: today,
        metricType: 'WATER',
        currentValue: 0,
        targetValue: profile.targetWaterMl,
        unit: 'ml',
        stepIncrement: waterStep,
        maxPoints: 20,
        pointsEarned: 0,
      });

      const stepTask = this.quantTaskRepository.create({
        userId,
        taskDate: today,
        metricType: 'STEPS',
        currentValue: 0,
        targetValue: profile.targetSteps,
        unit: 'steps',
        stepIncrement: 1000,
        maxPoints: 20,
        pointsEarned: 0,
      });

      await this.quantTaskRepository.save([waterTask, stepTask]);
    }

    // 2. Candidate Daily Tasks
    const candidateTasks = [
      {
        title: 'Bữa sáng lành mạnh',
        category: 'MEAL',
        taskType: 'MAIN',
        startTime: '07:00',
        endTime: '07:45',
        bufferMinutes: 30,
        basePoints: 10,
        metadata: { tip: 'Nên bổ sung đầy đủ đạm và tinh bột chuyển hóa chậm.' },
      },
      {
        title: 'Bữa trưa dinh dưỡng',
        category: 'MEAL',
        taskType: 'MAIN',
        startTime: '12:00',
        endTime: '12:45',
        bufferMinutes: 30,
        basePoints: 10,
        metadata: { tip: 'Ăn vừa đủ no để tránh buồn ngủ vào buổi chiều.' },
      },
      {
        title: 'Nghỉ trưa hồi phục',
        category: 'REST',
        taskType: 'MAIN',
        startTime: '12:45',
        endTime: '13:15',
        bufferMinutes: 15,
        basePoints: 10,
        metadata: { tip: 'Chợp mắt 15-20 phút giúp não bộ tươi tỉnh trở lại.' },
      },
      {
        title: 'Bữa tối thanh nhẹ',
        category: 'MEAL',
        taskType: 'MAIN',
        startTime: '19:00',
        endTime: '19:45',
        bufferMinutes: 30,
        basePoints: 10,
        metadata: { tip: 'Ăn nhiều rau xanh và ăn cách giờ ngủ ít nhất 2 tiếng.' },
      },
      {
        title: 'Chuẩn bị ngủ & Thả lỏng',
        category: 'SLEEP',
        taskType: 'MAIN',
        startTime: profile.sleepTime || '22:30',
        endTime: '23:30',
        bufferMinutes: 30,
        basePoints: 10,
        metadata: { tip: 'Cất điện thoại trước khi lên giường 30 phút.' },
      },
      {
        title: 'Vươn vai và xoay khớp 5 nhịp',
        category: 'EXERCISE',
        taskType: 'MINI_EVENT',
        startTime: currentTimeStr,
        endTime: '23:59',
        durationMinutes: 15,
        bufferMinutes: 0,
        basePoints: 10,
        metadata: { tip: 'Đứng dậy hít thở sâu và kéo giãn cột sống.' },
      },
    ];

    const existingTasks = await this.taskRepository.find({
      where: { userId, taskDate: today },
    });

    if (existingTasks.length === 0) {
      // MID-DAY RULE: Only keep tasks that end AFTER current time, or mini events
      const validTasks = candidateTasks.filter((task) => {
        if (task.taskType === 'MINI_EVENT') return true;
        return task.endTime >= currentTimeStr;
      });

      const tasksToCreate = validTasks.map((t) =>
        this.taskRepository.create({
          userId,
          taskDate: today,
          title: t.title,
          category: t.category,
          taskType: t.taskType,
          startTime: t.startTime,
          endTime: t.endTime,
          durationMinutes: t.durationMinutes ?? undefined,
          bufferMinutes: t.bufferMinutes,
          basePoints: t.basePoints,
          status: 'UPCOMING',
          metadata: t.metadata,
        }),
      );

      await this.taskRepository.save(tasksToCreate);
    }

    // 3. Daily Progress Initialization
    const existingProgress = await this.progressRepository.findOne({
      where: { userId, progressDate: today },
    });

    if (!existingProgress) {
      const progress = this.progressRepository.create({
        userId,
        progressDate: today,
        mainTaskPoints: 0,
        quantitativePoints: 0,
        eventVaultPoints: 0,
        isVaultUnlocked: false,
        completionRate: 0,
      });
      await this.progressRepository.save(progress);
    }
  }
}
