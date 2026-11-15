import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from '../../entities/user-profile.entity';
import { DailyTask } from '../../entities/daily-task.entity';
import { QuantitativeTask } from '../../entities/quantitative-task.entity';
import { DailyProgress } from '../../entities/daily-progress.entity';
import { SystemConfig } from '../../entities/system-config.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfile,
      DailyTask,
      QuantitativeTask,
      DailyProgress,
      SystemConfig,
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
