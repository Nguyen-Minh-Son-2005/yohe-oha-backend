import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1794728739667 implements MigrationInterface {
    name = 'InitialSchema1794728739667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryRunner.query(`CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "age" integer NOT NULL, "gender" character varying(10) NOT NULL, "height_cm" double precision NOT NULL, "weight_kg" double precision NOT NULL, "activity_level" character varying(50) NOT NULL, "health_mode" character varying(50) NOT NULL DEFAULT 'HEALTHY_NEUTRAL', "wake_time" character varying(10) NOT NULL, "sleep_time" character varying(10) NOT NULL, "work_start_time" character varying(10) NOT NULL, "work_end_time" character varying(10) NOT NULL, "bmi" double precision NOT NULL, "bmr" double precision NOT NULL, "tdee" double precision NOT NULL, "target_water_ml" integer NOT NULL, "target_steps" integer NOT NULL DEFAULT '8000', "preferences" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6ca9503d77ae39b4b5a6cc3ba88" UNIQUE ("user_id"), CONSTRAINT "REL_6ca9503d77ae39b4b5a6cc3ba8" UNIQUE ("user_id"), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_check_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "task_id" uuid NOT NULL, "user_id" uuid NOT NULL, "checked_at" TIMESTAMP NOT NULL DEFAULT now(), "client_time" TIMESTAMP NOT NULL, "points_awarded" integer NOT NULL, "check_type" character varying(30) NOT NULL, CONSTRAINT "PK_5779cdf43b21462e6b0f70783f6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "daily_tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "task_date" date NOT NULL, "title" character varying(150) NOT NULL, "category" character varying(50) NOT NULL, "task_type" character varying(20) NOT NULL DEFAULT 'MAIN', "start_time" character varying(10) NOT NULL, "end_time" character varying(10) NOT NULL, "duration_minutes" integer, "buffer_minutes" integer NOT NULL DEFAULT '30', "base_points" integer NOT NULL DEFAULT '10', "status" character varying(20) NOT NULL DEFAULT 'UPCOMING', "metadata" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_141a96e8b2a5f80277d690a4bd8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c77d2c37a7757f5e9b077f4e3c" ON "daily_tasks"  ("user_id", "task_date") `);
        await queryRunner.query(`CREATE TABLE "quantitative_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantitative_task_id" uuid NOT NULL, "user_id" uuid NOT NULL, "increment_value" integer NOT NULL, "logged_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e1149b3530410986d9097ba2303" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quantitative_tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "task_date" date NOT NULL, "metric_type" character varying(50) NOT NULL, "current_value" integer NOT NULL DEFAULT '0', "target_value" integer NOT NULL, "unit" character varying(20) NOT NULL, "step_increment" integer NOT NULL DEFAULT '200', "max_points" integer NOT NULL DEFAULT '20', "points_earned" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a141f97d446c000d12ae7df428d" UNIQUE ("user_id", "task_date", "metric_type"), CONSTRAINT "PK_402748e60652a1b694d38754567" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "nickname" character varying(100) NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'USER', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "daily_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "progress_date" date NOT NULL, "main_task_points" integer NOT NULL DEFAULT '0', "quantitative_points" integer NOT NULL DEFAULT '0', "event_vault_points" integer NOT NULL DEFAULT '0', "is_vault_unlocked" boolean NOT NULL DEFAULT false, "completion_rate" double precision NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1d8b73a123c9b0e60abc7a2050b" UNIQUE ("user_id", "progress_date"), CONSTRAINT "PK_f0fbbbc35098c23afdfb5c2f436" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "system_configs" ("config_key" character varying(100) NOT NULL, "config_value" text NOT NULL, "description" text, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8430d4ebdc1faef3d3eeef36e87" PRIMARY KEY ("config_key"))`);
        await queryRunner.query(`CREATE TABLE "system_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "time_slot" character varying(20) NOT NULL DEFAULT 'ALL', "category" character varying(50) NOT NULL DEFAULT 'INSPIRATION', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ca246ef4101e88f99e87a8f0ac2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_check_logs" ADD CONSTRAINT "FK_26c079445e385825e4f47a1b81b" FOREIGN KEY ("task_id") REFERENCES "daily_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_check_logs" ADD CONSTRAINT "FK_aee711acfbf2ee142d1bc623430" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_tasks" ADD CONSTRAINT "FK_06b515d49982c8df6fde9306ef6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quantitative_logs" ADD CONSTRAINT "FK_802899a5a02e86eb31524d00ac8" FOREIGN KEY ("quantitative_task_id") REFERENCES "quantitative_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quantitative_logs" ADD CONSTRAINT "FK_e39f520232769804e52b3f77acd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quantitative_tasks" ADD CONSTRAINT "FK_60ffb9c267af5e34c8e787889c0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_progress" ADD CONSTRAINT "FK_6b871e8157ac15e6a4217df895c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_progress" DROP CONSTRAINT "FK_6b871e8157ac15e6a4217df895c"`);
        await queryRunner.query(`ALTER TABLE "quantitative_tasks" DROP CONSTRAINT "FK_60ffb9c267af5e34c8e787889c0"`);
        await queryRunner.query(`ALTER TABLE "quantitative_logs" DROP CONSTRAINT "FK_e39f520232769804e52b3f77acd"`);
        await queryRunner.query(`ALTER TABLE "quantitative_logs" DROP CONSTRAINT "FK_802899a5a02e86eb31524d00ac8"`);
        await queryRunner.query(`ALTER TABLE "daily_tasks" DROP CONSTRAINT "FK_06b515d49982c8df6fde9306ef6"`);
        await queryRunner.query(`ALTER TABLE "task_check_logs" DROP CONSTRAINT "FK_aee711acfbf2ee142d1bc623430"`);
        await queryRunner.query(`ALTER TABLE "task_check_logs" DROP CONSTRAINT "FK_26c079445e385825e4f47a1b81b"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`);
        await queryRunner.query(`DROP TABLE "system_messages"`);
        await queryRunner.query(`DROP TABLE "system_configs"`);
        await queryRunner.query(`DROP TABLE "daily_progress"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "quantitative_tasks"`);
        await queryRunner.query(`DROP TABLE "quantitative_logs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c77d2c37a7757f5e9b077f4e3c"`);
        await queryRunner.query(`DROP TABLE "daily_tasks"`);
        await queryRunner.query(`DROP TABLE "task_check_logs"`);
        await queryRunner.query(`DROP TABLE "user_profiles"`);
    }

}
