import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { DailyTask } from './daily-task.entity';
import { QuantitativeTask } from './quantitative-task.entity';
import { DailyProgress } from './daily-progress.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  nickname: string;

  @Column({ type: 'varchar', length: 20, default: 'USER' })
  role: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;

  @OneToMany(() => DailyTask, (task) => task.user)
  dailyTasks: DailyTask[];

  @OneToMany(() => QuantitativeTask, (task) => task.user)
  quantitativeTasks: QuantitativeTask[];

  @OneToMany(() => DailyProgress, (progress) => progress.user)
  dailyProgress: DailyProgress[];
}
