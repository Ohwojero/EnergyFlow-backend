import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FuelTransferService } from './fuel-transfer.service';
import { CreateFuelTransferDto } from './dto/create-fuel-transfer.dto';
import { UpdateFuelTransferDto } from './dto/update-fuel-transfer.dto';

@Controller('fuel-transfer')
@UseGuards(JwtAuthGuard)
export class FuelTransferController {
  constructor(private readonly fuelTransferService: FuelTransferService) {}

  @Post()
  create(@Body() createDto: CreateFuelTransferDto) {
    return this.fuelTransferService.create(createDto);
  }

  @Get('branch/:branchId')
  findByBranch(@Param('branchId') branchId: string) {
    return this.fuelTransferService.findByBranch(branchId);
  }

  @Get()
  findAll() {
    return this.fuelTransferService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFuelTransferDto) {
    return this.fuelTransferService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fuelTransferService.remove(id);
  }
}
