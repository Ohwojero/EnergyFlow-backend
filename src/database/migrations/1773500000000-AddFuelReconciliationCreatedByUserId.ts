import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFuelReconciliationCreatedByUserId1773500000000 implements MigrationInterface {
  name = 'AddFuelReconciliationCreatedByUserId1773500000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fuel_reconciliations" ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fuel_reconciliations" DROP COLUMN IF EXISTS "created_by_user_id"`,
    )
  }
}
