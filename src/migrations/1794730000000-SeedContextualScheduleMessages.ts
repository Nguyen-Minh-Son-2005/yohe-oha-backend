import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedContextualScheduleMessages1794730000000 implements MigrationInterface {
  name = 'SeedContextualScheduleMessages1794730000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "system_messages" ("id", "content", "time_slot", "category", "is_active") VALUES
      (uuid_generate_v4(), 'Bây giờ đã là {time}, bạn hãy đảm bảo ngủ đủ giấc để chuẩn bị cho một ngày đầy năng lượng nhé!', 'POST_SLEEP', 'HEALTH_TIP', true),
      (uuid_generate_v4(), 'Đã quá giờ đi ngủ rồi ({time}), hãy tắt màn hình điện thoại và để mắt được nghỉ ngơi nhé.', 'POST_SLEEP', 'REMINDER', true),
      (uuid_generate_v4(), 'Cơ thể phục hồi tốt nhất trong giấc ngủ đêm ({time}). Chúc bạn có một giấc ngủ thật ngon!', 'POST_SLEEP', 'INSPIRATION', true),
      (uuid_generate_v4(), 'Bạn đang trong khung giờ làm việc/học tập, hãy tập trung cao độ và ngồi đúng tư thế nhé!', 'WORKING', 'REMINDER', true),
      (uuid_generate_v4(), 'Trong giờ làm việc, thỉnh thoảng hãy chớp mắt, phóng tầm mắt ra xa và uống một ngụm nước nhé.', 'WORKING', 'HEALTH_TIP', true),
      (uuid_generate_v4(), 'Làm việc hiệu quả kết hợp nghỉ ngơi ngắn 5 phút sẽ giúp bạn duy trì năng lượng suốt ngày dài.', 'WORKING', 'INSPIRATION', true);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "system_messages" WHERE "time_slot" IN ('POST_SLEEP', 'WORKING');
    `);
  }
}
