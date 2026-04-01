import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserTrackingToGasTransactions1772463935100 implements MigrationInterface {
  name = 'AddUserTrackingToGasTransactions1772463935100'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gas_transactions" ADD "created_by_user_id" uuid`)
    await queryRunner.query(`ALTER TABLE "gas_transactions" ADD "created_by_role" character varying(40)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gas_transactions" DROP COLUMN "created_by_role"`)
    await queryRunner.query(`ALTER TABLE "gas_transactions" DROP COLUMN "created_by_user_id"`)
  }
}
