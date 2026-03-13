import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBusinessTypeToUser1773700000000 implements MigrationInterface {
  name = 'AddBusinessTypeToUser1773700000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if enum type exists, create if not
    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'user_business_type_enum'
    `)
    
    if (enumExists.length === 0) {
      await queryRunner.query(`CREATE TYPE "public"."user_business_type_enum" AS ENUM('gas', 'fuel')`)
    }
    
    // Check if column exists, add if not
    const columnExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'business_type'
    `)
    
    if (columnExists.length === 0) {
      await queryRunner.query(`ALTER TABLE "users" ADD "business_type" "public"."user_business_type_enum"`)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove business_type column
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_type"`)
    
    // Drop enum type
    await queryRunner.query(`DROP TYPE "public"."user_business_type_enum"`)
  }
}