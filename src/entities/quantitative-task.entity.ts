import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { QuantitativeLog } from './quantitative-log.entity';

@Entity('quantitative_tasks')
@Unique(['userId', 'taskDate', 'metricType'])
export class QuantitativeTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.quantitativeTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', name: 'task_date' })
  taskDate: string; // YYYY-MM-DD

  @Column({ type: 'varchar', length: 50, name: 'metric_type' })
  metricType: string; // WATER, STEPS

  @Column({ type: 'int', name: 'current_value', default: 0 })
  currentValue: number;

  @Column({ type: 'int', name: 'target_value' })
  targetValue: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string; // ml, steps

  @Column({ type: 'int', name: 'step_increment', default: 200 })
  stepIncrement: number;

  @Column({ type: 'int', name: 'max_points', default: 20 })
  maxPoints: number;

  @Column({ type: 'int', name: 'points_earned', default: 0 })
  pointsEarned: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => QuantitativeLog, (log) => log.quantitativeTask)
  logs: QuantitativeLog[];
}
