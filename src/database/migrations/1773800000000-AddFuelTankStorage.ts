import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFuelTankStorage1773800000000 implements MigrationInterface {
  name = 'AddFuelTankStorage1773800000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "fuel_tanks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "product_type" "public"."fuel_products_type_enum" NOT NULL, "capacity_litres" numeric(14,2) NOT NULL, "current_volume_litres" numeric(14,2) NOT NULL DEFAULT '0', "status" character varying(30) NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "branchId" uuid, CONSTRAINT "PK_62e39f989df8ecf62909d3d4df9" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE TABLE "fuel_tank_readings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reading_date" date NOT NULL, "opening_volume_litres" numeric(14,2) NOT NULL, "deliveries_litres" numeric(14,2) NOT NULL DEFAULT '0', "transfers_out_litres" numeric(14,2) NOT NULL DEFAULT '0', "sales_litres" numeric(14,2) NOT NULL DEFAULT '0', "expected_closing_litres" numeric(14,2) NOT NULL, "actual_closing_litres" numeric(14,2) NOT NULL, "variance_litres" numeric(14,2) NOT NULL, "dip_reading_litres" numeric(14,2), "sensor_volume_litres" numeric(14,2), "recorded_by_name" character varying(200), "notes" character varying(500) NOT NULL DEFAULT '', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tankId" uuid, CONSTRAINT "PK_0aa607d1ec34d2fb863d97fa6e6" PRIMARY KEY ("id"))`)
    await queryRunner.query(`ALTER TABLE "fuel_tanks" ADD CONSTRAINT "FK_b0e9e52f3fd965d8ecbd463ca26" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "fuel_tank_readings" ADD CONSTRAINT "FK_1ebd14ef727fd760f7f2f31f515" FOREIGN KEY ("tankId") REFERENCES "fuel_tanks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fuel_tank_readings" DROP CONSTRAINT "FK_1ebd14ef727fd760f7f2f31f515"`)
    await queryRunner.query(`ALTER TABLE "fuel_tanks" DROP CONSTRAINT "FK_b0e9e52f3fd965d8ecbd463ca26"`)
    await queryRunner.query(`DROP TABLE "fuel_tank_readings"`)
    await queryRunner.query(`DROP TABLE "fuel_tanks"`)
  }
}
