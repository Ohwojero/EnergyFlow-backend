import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1772463935097 implements MigrationInterface {
    name = 'AutoMigration1772463935097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."gas_cylinders_size_enum" AS ENUM('12.5kg', '25kg', '50kg')`);
        await queryRunner.query(`CREATE TYPE "public"."gas_cylinders_status_enum" AS ENUM('in_stock', 'refilling', 'damaged')`);
        await queryRunner.query(`CREATE TABLE "gas_cylinders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "size" "public"."gas_cylinders_size_enum" NOT NULL, "status" "public"."gas_cylinders_status_enum" NOT NULL, "quantity" integer NOT NULL, "purchase_price" numeric(14,2) NOT NULL, "selling_price" numeric(14,2) NOT NULL, "last_updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "branchId" uuid, CONSTRAINT "PK_c316062de22d657676f882e2c15" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."gas_transactions_type_enum" AS ENUM('sale', 'purchase', 'refill')`);
        await queryRunner.query(`CREATE TABLE "gas_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."gas_transactions_type_enum" NOT NULL, "cylinder_size" character varying(40) NOT NULL, "quantity" integer NOT NULL, "amount" numeric(14,2) NOT NULL, "notes" character varying(400) NOT NULL DEFAULT '', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "branchId" uuid, CONSTRAINT "PK_ade07738f23d43b9ae2651f14f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gas_daily_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "pump_readings" jsonb NOT NULL, "system_record_kg" numeric(14,2) NOT NULL, "sun_adjustment_kg" numeric(14,2) NOT NULL, "total_kg" numeric(14,2) NOT NULL, "payment_breakdown" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "branchId" uuid, CONSTRAINT "PK_47c1b335e54d47cffb5efb8014e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fuel_products_type_enum" AS ENUM('PMS', 'AGO', 'DPK')`);
        await queryRunner.query(`CREATE TABLE "fuel_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."fuel_products_type_enum" NOT NULL, "quantity" numeric(14,2) NOT NULL, "unit_price" numeric(14,2) NOT NULL, "total_value" numeric(14,2) NOT NULL, "branchId" uuid, CONSTRAINT "PK_83f8ddac02a008b87ab0f269e8f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fuel_pumps_product_type_enum" AS ENUM('PMS', 'AGO', 'DPK')`);
        await queryRunner.query(`CREATE TABLE "fuel_pumps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pump_number" character varying(40) NOT NULL, "product_type" "public"."fuel_pumps_product_type_enum" NOT NULL, "current_reading" numeric(14,2) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'active', "branchId" uuid, CONSTRAINT "PK_dc0255620af5f25e367c242aa5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fuel_reconciliations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "shift_number" integer NOT NULL, "start_reading" numeric(14,2) NOT NULL, "end_reading" numeric(14,2) NOT NULL, "sales_amount" numeric(14,2) NOT NULL, "variance" numeric(14,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "branchId" uuid, "pumpId" uuid, CONSTRAINT "PK_d5bcb0d66b4bb1699e0bf33272e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fuel_expenses_category_enum" AS ENUM('pump_maintenance', 'tank_cleaning', 'filter_replacement', 'other')`);
        await queryRunner.query(`CREATE TABLE "fuel_expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" "public"."fuel_expenses_category_enum" NOT NULL, "amount" numeric(14,2) NOT NULL, "description" character varying(400) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "branchId" uuid, CONSTRAINT "PK_eea7adf66693982754efc810476" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."gas_expenses_category_enum" AS ENUM('cylinder_repair', 'safety_inspection', 'maintenance', 'other')`);
        await queryRunner.query(`CREATE TABLE "gas_expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" "public"."gas_expenses_category_enum" NOT NULL, "amount" numeric(14,2) NOT NULL, "description" character varying(400) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "branchId" uuid, CONSTRAINT "PK_80e27cae376fb1d9197abe8d3b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."branches_type_enum" AS ENUM('gas', 'fuel')`);
        await queryRunner.query(`CREATE TABLE "branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "type" "public"."branches_type_enum" NOT NULL, "location" character varying(200) NOT NULL, "status" character varying(40) NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid, "managerId" uuid, CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'org_owner', 'gas_manager', 'fuel_manager', 'sales_staff')`);
        await queryRunner.query(`CREATE TYPE "public"."users_assigned_branch_types_enum" AS ENUM('gas', 'fuel')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(200) NOT NULL, "name" character varying(200) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "assigned_branch_types" "public"."users_assigned_branch_types_enum" array NOT NULL DEFAULT '{}', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invoices_plan_type_enum" AS ENUM('personal', 'organisation')`);
        await queryRunner.query(`CREATE TYPE "public"."invoices_status_enum" AS ENUM('paid', 'failed')`);
        await queryRunner.query(`CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_number" character varying(40) NOT NULL, "plan_type" "public"."invoices_plan_type_enum" NOT NULL, "amount" numeric(14,2) NOT NULL, "payment_date" date NOT NULL, "status" "public"."invoices_status_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid, CONSTRAINT "UQ_d8f8d3788694e1b3f96c42c36fb" UNIQUE ("invoice_number"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tenants_subscription_plan_enum" AS ENUM('personal', 'organisation')`);
        await queryRunner.query(`CREATE TYPE "public"."tenants_status_enum" AS ENUM('active', 'suspended')`);
        await queryRunner.query(`CREATE TYPE "public"."tenants_branch_types_enum" AS ENUM('gas', 'fuel')`);
        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "subscription_plan" "public"."tenants_subscription_plan_enum" NOT NULL, "owner_name" character varying(200) NOT NULL DEFAULT '', "owner_email" character varying(200) NOT NULL DEFAULT '', "status" "public"."tenants_status_enum" NOT NULL DEFAULT 'active', "branch_types" "public"."tenants_branch_types_enum" array NOT NULL DEFAULT '{}', "last_active" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying(120) NOT NULL, "description" character varying(400) NOT NULL, "ip_address" character varying(80) NOT NULL DEFAULT 'system', "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid, "userId" uuid, CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_branches" ("usersId" uuid NOT NULL, "branchesId" uuid NOT NULL, CONSTRAINT "PK_43306df5df7ed0a4b487da8ed40" PRIMARY KEY ("usersId", "branchesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e5edb63217b1a59e237138be84" ON "user_branches" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c0b1ce9184781a70740f35d947" ON "user_branches" ("branchesId") `);
        await queryRunner.query(`ALTER TABLE "gas_cylinders" ADD CONSTRAINT "FK_80503065f59685ea2e30788eaf6" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gas_transactions" ADD CONSTRAINT "FK_14acf32447d7ce74313a4c63b5b" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gas_daily_activities" ADD CONSTRAINT "FK_b8854726e8a0897570a0ef75886" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fuel_products" ADD CONSTRAINT "FK_9eaee7b678046a59dcebe6a4914" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fuel_pumps" ADD CONSTRAINT "FK_625641125bba25bbd70f1493ade" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fuel_reconciliations" ADD CONSTRAINT "FK_ac71f28e3972687b3b3a9456c3b" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fuel_reconciliations" ADD CONSTRAINT "FK_8186751df2ef8d5e940ec8ee69f" FOREIGN KEY ("pumpId") REFERENCES "fuel_pumps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fuel_expenses" ADD CONSTRAINT "FK_5d0e9d16699f33285ac4fba7a83" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gas_expenses" ADD CONSTRAINT "FK_17738f0cb8c4d0f2ac0516448c4" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_19db6a12993aa421cc984376635" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_c838236a857999259f3d33277a7" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_89c82485e364081f457b210120d" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_38cc2ea20240678a35991d9f676" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_597e6df96098895bf19d4b5ea45" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_branches" ADD CONSTRAINT "FK_e5edb63217b1a59e237138be84b" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_branches" ADD CONSTRAINT "FK_c0b1ce9184781a70740f35d947b" FOREIGN KEY ("branchesId") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_branches" DROP CONSTRAINT "FK_c0b1ce9184781a70740f35d947b"`);
        await queryRunner.query(`ALTER TABLE "user_branches" DROP CONSTRAINT "FK_e5edb63217b1a59e237138be84b"`);
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_597e6df96098895bf19d4b5ea45"`);
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_38cc2ea20240678a35991d9f676"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_89c82485e364081f457b210120d"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_c838236a857999259f3d33277a7"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_19db6a12993aa421cc984376635"`);
        await queryRunner.query(`ALTER TABLE "gas_expenses" DROP CONSTRAINT "FK_17738f0cb8c4d0f2ac0516448c4"`);
        await queryRunner.query(`ALTER TABLE "fuel_expenses" DROP CONSTRAINT "FK_5d0e9d16699f33285ac4fba7a83"`);
        await queryRunner.query(`ALTER TABLE "fuel_reconciliations" DROP CONSTRAINT "FK_8186751df2ef8d5e940ec8ee69f"`);
        await queryRunner.query(`ALTER TABLE "fuel_reconciliations" DROP CONSTRAINT "FK_ac71f28e3972687b3b3a9456c3b"`);
        await queryRunner.query(`ALTER TABLE "fuel_pumps" DROP CONSTRAINT "FK_625641125bba25bbd70f1493ade"`);
        await queryRunner.query(`ALTER TABLE "fuel_products" DROP CONSTRAINT "FK_9eaee7b678046a59dcebe6a4914"`);
        await queryRunner.query(`ALTER TABLE "gas_daily_activities" DROP CONSTRAINT "FK_b8854726e8a0897570a0ef75886"`);
        await queryRunner.query(`ALTER TABLE "gas_transactions" DROP CONSTRAINT "FK_14acf32447d7ce74313a4c63b5b"`);
        await queryRunner.query(`ALTER TABLE "gas_cylinders" DROP CONSTRAINT "FK_80503065f59685ea2e30788eaf6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c0b1ce9184781a70740f35d947"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e5edb63217b1a59e237138be84"`);
        await queryRunner.query(`DROP TABLE "user_branches"`);
        await queryRunner.query(`DROP TABLE "activity_logs"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP TYPE "public"."tenants_branch_types_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tenants_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tenants_subscription_plan_enum"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."invoices_plan_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_assigned_branch_types_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "branches"`);
        await queryRunner.query(`DROP TYPE "public"."branches_type_enum"`);
        await queryRunner.query(`DROP TABLE "gas_expenses"`);
        await queryRunner.query(`DROP TYPE "public"."gas_expenses_category_enum"`);
        await queryRunner.query(`DROP TABLE "fuel_expenses"`);
        await queryRunner.query(`DROP TYPE "public"."fuel_expenses_category_enum"`);
        await queryRunner.query(`DROP TABLE "fuel_reconciliations"`);
        await queryRunner.query(`DROP TABLE "fuel_pumps"`);
        await queryRunner.query(`DROP TYPE "public"."fuel_pumps_product_type_enum"`);
        await queryRunner.query(`DROP TABLE "fuel_products"`);
        await queryRunner.query(`DROP TYPE "public"."fuel_products_type_enum"`);
        await queryRunner.query(`DROP TABLE "gas_daily_activities"`);
        await queryRunner.query(`DROP TABLE "gas_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."gas_transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "gas_cylinders"`);
        await queryRunner.query(`DROP TYPE "public"."gas_cylinders_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."gas_cylinders_size_enum"`);
    }

}
