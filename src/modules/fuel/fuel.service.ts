import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Branch } from '../../entities/branch.entity'
import { FuelProduct } from '../../entities/fuel-product.entity'
import { FuelPump } from '../../entities/fuel-pump.entity'
import { ShiftReconciliation } from '../../entities/shift-reconciliation.entity'
import { FuelExpense } from '../../entities/fuel-expense.entity'
import { BranchType, UserRole } from '../../common/enums'
import { CreateFuelProductDto } from './dto/create-fuel-product.dto'
import { CreateFuelPumpDto } from './dto/create-fuel-pump.dto'
import { CreateFuelReconciliationDto } from './dto/create-fuel-reconciliation.dto'
import { CreateFuelExpenseDto } from './dto/create-fuel-expense.dto'

@Injectable()
export class FuelService {
  constructor(
    @InjectRepository(Branch) private branchesRepo: Repository<Branch>,
    @InjectRepository(FuelProduct) private productsRepo: Repository<FuelProduct>,
    @InjectRepository(FuelPump) private pumpsRepo: Repository<FuelPump>,
    @InjectRepository(ShiftReconciliation) private reconciliationsRepo: Repository<ShiftReconciliation>,
    @InjectRepository(FuelExpense) private expensesRepo: Repository<FuelExpense>,
  ) {}

  async getBranches(current: { role: UserRole; tenant_id?: string }) {
    if (current.role === UserRole.SUPER_ADMIN) {
      return this.branchesRepo.find({ where: { type: BranchType.FUEL } })
    }
    if (!current.tenant_id) return []
    return this.branchesRepo.find({
      where: { type: BranchType.FUEL, tenant: { id: current.tenant_id } },
    })
  }

  async createProduct(current: any, dto: CreateFuelProductDto) {
    const branch = await this.ensureBranch(dto.branch_id, current)
    const product = this.productsRepo.create({
      branch,
      type: dto.type,
      quantity: dto.quantity,
      unit_price: dto.unit_price,
      total_value: dto.total_value,
    })
    return this.productsRepo.save(product)
  }

  async listProducts(current: any, branchId: string) {
    await this.ensureBranch(branchId, current)
    return this.productsRepo.find({
      where: { branch: { id: branchId } },
      relations: ['branch'],
    })
  }

  async createPump(current: any, dto: CreateFuelPumpDto) {
    const branch = await this.ensureBranch(dto.branch_id, current)
    const pump = this.pumpsRepo.create({
      branch,
      pump_number: dto.pump_number,
      product_type: dto.product_type,
      current_reading: dto.current_reading,
      status: dto.status,
    })
    return this.pumpsRepo.save(pump)
  }

  async listPumps(current: any, branchId: string) {
    await this.ensureBranch(branchId, current)
    return this.pumpsRepo.find({ where: { branch: { id: branchId } } })
  }

  async createReconciliation(current: any, dto: CreateFuelReconciliationDto) {
    const branch = await this.ensureBranch(dto.branch_id, current)
    const pump = dto.pump_id
      ? await this.pumpsRepo.findOne({ where: { id: dto.pump_id } })
      : null
    const reconciliation = this.reconciliationsRepo.create({
      branch,
      pump: pump ?? null,
      shift_number: dto.shift_number,
      start_reading: dto.start_reading,
      end_reading: dto.end_reading,
      sales_amount: dto.sales_amount,
      variance: dto.variance,
    })
    return this.reconciliationsRepo.save(reconciliation)
  }

  async listReconciliations(current: any, branchId: string) {
    await this.ensureBranch(branchId, current)
    return this.reconciliationsRepo.find({
      where: { branch: { id: branchId } },
      relations: ['pump', 'branch'],
    })
  }

  async createExpense(current: any, dto: CreateFuelExpenseDto) {
    const branch = await this.ensureBranch(dto.branch_id, current)
    const expense = this.expensesRepo.create({
      branch,
      category: dto.category,
      amount: dto.amount,
      description: dto.description,
    })
    return this.expensesRepo.save(expense)
  }

  async listExpenses(current: any, branchId: string) {
    await this.ensureBranch(branchId, current)
    return this.expensesRepo.find({ where: { branch: { id: branchId } } })
  }

  async listAllExpenses(current: any) {
    if (current.role === UserRole.SUPER_ADMIN) {
      return this.expensesRepo.find({ relations: ['branch'] })
    }
    if (!current.tenant_id) return []
    return this.expensesRepo
      .createQueryBuilder('ex')
      .leftJoinAndSelect('ex.branch', 'branch')
      .leftJoin('branch.tenant', 'tenant')
      .where('tenant.id = :tenantId', { tenantId: current.tenant_id })
      .orderBy('ex.created_at', 'DESC')
      .getMany()
  }

  async analytics(current: any, branchId: string) {
    await this.ensureBranch(branchId, current)
    const inventory = await this.productsRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.total_value), 0)', 'total')
      .where('p.branchId = :branchId', { branchId })
      .getRawOne()

    const expenses = await this.expensesRepo
      .createQueryBuilder('ex')
      .select('COALESCE(SUM(ex.amount), 0)', 'total')
      .where('ex.branchId = :branchId', { branchId })
      .getRawOne()

    return {
      inventory_value: Number(inventory.total ?? 0),
      total_expenses: Number(expenses.total ?? 0),
    }
  }

  private async ensureBranch(branchId: string, current: any) {
    const branch = await this.branchesRepo.findOne({
      where: { id: branchId },
      relations: ['tenant'],
    })
    if (!branch) {
      throw new NotFoundException('Branch not found')
    }
    if (current.role !== UserRole.SUPER_ADMIN && branch.tenant?.id !== current.tenant_id) {
      throw new BadRequestException('Unauthorized branch access')
    }
    if (branch.type !== BranchType.FUEL) {
      throw new BadRequestException('Branch is not fuel type')
    }
    return branch
  }
}
