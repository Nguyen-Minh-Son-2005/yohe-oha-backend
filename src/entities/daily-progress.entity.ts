import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('daily_progress')
@Unique(['userId', 'progressDate'])
export class DailyProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.dailyProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', name: 'progress_date' })
  progressDate: string; // YYYY-MM-DD

  @Column({ type: 'int', name: 'main_task_points', default: 0 })
  mainTaskPoints: number;

  @Column({ type: 'int', name: 'quantitative_points', default: 0 })
  quantitativePoints: number;

  @Column({ type: 'int', name: 'event_vault_points', default: 0 })
  eventVaultPoints: number;

  @Column({ type: 'boolean', name: 'is_vault_unlocked', default: false })
  isVaultUnlocked: boolean;

  @Column({ type: 'float', name: 'completion_rate', default: 0 })
  completionRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
