import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelTransfer } from '../../entities/fuel-transfer.entity';
import { FuelTransferController } from './fuel-transfer.controller';
import { FuelTransferService } from './fuel-transfer.service';

@Module({
  imports: [TypeOrmModule.forFeature([FuelTransfer])],
  controllers: [FuelTransferController],
  providers: [FuelTransferService],
  exports: [FuelTransferService],
})
export class FuelTransferModule {}
