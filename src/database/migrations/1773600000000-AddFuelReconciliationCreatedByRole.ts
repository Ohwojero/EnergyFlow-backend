import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFuelReconciliationCreatedByRole1773600000000 implements MigrationInterface {
  name = 'AddFuelReconciliationCreatedByRole1773600000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fuel_reconciliations" ADD COLUMN IF NOT EXISTS "created_by_role" character varying(40)`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fuel_reconciliations" DROP COLUMN IF EXISTS "created_by_role"`,
    )
  }
}
