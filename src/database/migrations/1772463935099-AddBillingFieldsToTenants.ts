import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddBillingFieldsToTenants1772463935099 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tenants',
      new TableColumn({
        name: 'billing_cycle_start',
        type: 'timestamptz',
        isNullable: true,
      }),
    )

    await queryRunner.addColumn(
      'tenants',
      new TableColumn({
        name: 'last_payment_date',
        type: 'timestamptz',
        isNullable: true,
      }),
    )

    await queryRunner.addColumn(
      'tenants',
      new TableColumn({
        name: 'payment_reminder_sent',
        type: 'boolean',
        default: false,
      }),
    )

    await queryRunner.query(`
      UPDATE tenants
      SET billing_cycle_start = created_at
      WHERE billing_cycle_start IS NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tenants', 'payment_reminder_sent')
    await queryRunner.dropColumn('tenants', 'last_payment_date')
    await queryRunner.dropColumn('tenants', 'billing_cycle_start')
  }
}
