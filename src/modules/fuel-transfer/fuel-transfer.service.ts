import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuelTransfer } from '../../entities/fuel-transfer.entity';
import { CreateFuelTransferDto } from './dto/create-fuel-transfer.dto';

@Injectable()
export class FuelTransferService {
  constructor(
    @InjectRepository(FuelTransfer)
    private fuelTransferRepository: Repository<FuelTransfer>,
  ) {}

  async create(createDto: CreateFuelTransferDto): Promise<FuelTransfer> {
    const transfer = this.fuelTransferRepository.create(createDto);
    return this.fuelTransferRepository.save(transfer);
  }

  async findByBranch(branchId: string): Promise<FuelTransfer[]> {
    return this.fuelTransferRepository.find({
      where: { branch_id: branchId },
      order: { created_at: 'DESC' },
    });
  }

  async findAll(): Promise<FuelTransfer[]> {
    return this.fuelTransferRepository.find({
      order: { created_at: 'DESC' },
    });
  }
}
