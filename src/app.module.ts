import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { TenantsModule } from './modules/tenants/tenants.module'
import { BranchesModule } from './modules/branches/branches.module'
import { GasModule } from './modules/gas/gas.module'
import { FuelModule } from './modules/fuel/fuel.module'
import { AdminModule } from './modules/admin/admin.module'
import { SeedModule } from './modules/seed/seed.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') ?? 'localhost',
        port: Number(config.get<string>('DB_PORT') ?? '5432'),
        username: config.get<string>('DB_USER') ?? 'postgres',
        password: config.get<string>('DB_PASS') ?? 'postgres',
        database: config.get<string>('DB_NAME') ?? 'energyflow',
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNC') === 'true',
        logging: config.get<string>('DB_LOG') === 'true',
      }),
    }),
    AuthModule,
    UsersModule,
    TenantsModule,
    BranchesModule,
    GasModule,
    FuelModule,
    AdminModule,
    SeedModule,
  ],
})
export class AppModule {}
