import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar', length: 10 })
  gender: string; // MALE, FEMALE, OTHER

  @Column({ type: 'float', name: 'height_cm' })
  heightCm: number;

  @Column({ type: 'float', name: 'weight_kg' })
  weightKg: number;

  @Column({ type: 'varchar', length: 50, name: 'activity_level' })
  activityLevel: string; // SEDENTARY, LIGHT, MODERATE, VERY_ACTIVE

  @Column({ type: 'varchar', length: 50, name: 'health_mode', default: 'HEALTHY_NEUTRAL' })
  healthMode: string;

  @Column({ type: 'varchar', length: 10, name: 'wake_time' })
  wakeTime: string; // HH:mm

  @Column({ type: 'varchar', length: 10, name: 'sleep_time' })
  sleepTime: string; // HH:mm

  @Column({ type: 'varchar', length: 10, name: 'work_start_time' })
  workStartTime: string; // HH:mm

  @Column({ type: 'varchar', length: 10, name: 'work_end_time' })
  workEndTime: string; // HH:mm

  @Column({ type: 'float' })
  bmi: number;

  @Column({ type: 'float' })
  bmr: number;

  @Column({ type: 'float' })
  tdee: number;

  @Column({ type: 'int', name: 'target_water_ml' })
  targetWaterMl: number;

  @Column({ type: 'int', name: 'target_steps', default: 8000 })
  targetSteps: number;

  @Column({ type: 'jsonb', default: {} })
  preferences: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
