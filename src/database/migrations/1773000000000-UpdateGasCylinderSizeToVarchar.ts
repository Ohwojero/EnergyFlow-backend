import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateGasCylinderSizeToVarchar1773000000000 implements MigrationInterface {
  name = 'UpdateGasCylinderSizeToVarchar1773000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gas_cylinders" ALTER COLUMN "size" TYPE character varying(40) USING "size"::text`,
    )
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."gas_cylinders_size_enum"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."gas_cylinders_size_enum" AS ENUM('12.5kg', '25kg', '50kg')`,
    )
    await queryRunner.query(
      `ALTER TABLE "gas_cylinders" ALTER COLUMN "size" TYPE "public"."gas_cylinders_size_enum" USING (CASE WHEN "size" IN ('12.5kg', '25kg', '50kg') THEN "size" ELSE '12.5kg' END)::"public"."gas_cylinders_size_enum"`,
    )
  }
}
