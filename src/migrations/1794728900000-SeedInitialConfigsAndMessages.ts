import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialConfigsAndMessages1794728900000 implements MigrationInterface {
  name = 'SeedInitialConfigsAndMessages1794728900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed system configs
    await queryRunner.query(`
      INSERT INTO "system_configs" ("config_key", "config_value", "description") VALUES
      ('water_step_ml', '200', 'Lượng nước tăng mỗi lần chạm cốc (ml)'),
      ('water_daily_target_base', '2000', 'Mục tiêu nước hàng ngày mặc định (ml)'),
      ('walking_step_target_base', '8000', 'Mục tiêu số bước đi bộ hàng ngày mặc định'),
      ('mini_event_default_duration_min', '15', 'Thời gian hiệu lực đếm ngược mặc định của mini event (phút)'),
      ('main_task_exact_multiplier', '2', 'Hệ số nhân điểm khi check-in đúng khung giờ')
      ON CONFLICT ("config_key") DO NOTHING;
    `);

    // Seed system messages
    await queryRunner.query(`
      INSERT INTO "system_messages" ("id", "content", "time_slot", "category", "is_active") VALUES
      (uuid_generate_v4(), 'Chào buổi sáng! Hãy bắt đầu ngày mới bằng một ly nước ấm và nụ cười rạng rỡ nhé.', 'MORNING', 'INSPIRATION', true),
      (uuid_generate_v4(), 'Một bữa sáng đủ chất sẽ tiếp năng lượng cho cả ngày làm việc và học tập hiệu quả.', 'MORNING', 'HEALTH_TIP', true),
      (uuid_generate_v4(), 'Nghỉ ngơi một chút sau giờ làm việc căng thẳng, nạp năng lượng cho buổi chiều nào!', 'AFTERNOON', 'REMINDER', true),
      (uuid_generate_v4(), 'Đừng quên uống nước đều đặn để giữ cơ thể luôn tỉnh táo và tràn đầy sức sống.', 'AFTERNOON', 'HEALTH_TIP', true),
      (uuid_generate_v4(), 'Buổi tối an lành! Hãy thả lỏng cơ thể, hạn chế dùng màn hình trước khi ngủ nhé.', 'EVENING', 'INSPIRATION', true),
      (uuid_generate_v4(), 'Một giấc ngủ sâu và đúng giờ chính là liều thuốc phục hồi kỳ diệu nhất cho cơ thể bạn.', 'EVENING', 'HEALTH_TIP', true),
      (uuid_generate_v4(), 'Mỗi thói quen nhỏ lành mạnh hôm nay là một bước tiến đến sức khỏe vững bền ngày mai.', 'ALL', 'INSPIRATION', true);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "system_configs" WHERE "config_key" IN (
        'water_step_ml',
        'water_daily_target_base',
        'walking_step_target_base',
        'mini_event_default_duration_min',
        'main_task_exact_multiplier'
      );
    `);
    await queryRunner.query(`DELETE FROM "system_messages";`);
  }
}
