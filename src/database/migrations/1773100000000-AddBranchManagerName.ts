import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBranchManagerName1773100000000 implements MigrationInterface {
  name = 'AddBranchManagerName1773100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "manager_name" character varying(200) NOT NULL DEFAULT 'Unassigned'`,
    )
    await queryRunner.query(
      `UPDATE "branches" b SET "manager_name" = u."name" FROM "users" u WHERE b."managerId" = u."id"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN IF EXISTS "manager_name"`)
  }
}
