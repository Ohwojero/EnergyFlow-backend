import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFuelReconciliationSalesStaffName1773200000000 implements MigrationInterface {
  name = 'AddFuelReconciliationSalesStaffName1773200000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fuel_reconciliations" ADD COLUMN IF NOT EXISTS "sales_staff_name" character varying(200) NOT NULL DEFAULT 'Unassigned'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fuel_reconciliations" DROP COLUMN IF EXISTS "sales_staff_name"`,
    )
  }
}
