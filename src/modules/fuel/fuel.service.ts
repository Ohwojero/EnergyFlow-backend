import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Branch } from '../../entities/branch.entity'
import { FuelProduct } from '../../entities/fuel-product.entity'
import { FuelPump } from '../../entities/fuel-pump.entity'
import { ShiftReconciliation } from '../../entities/shift-reconciliation.entity'
import { FuelExpense } from '../../entities/fuel-expense.entity'
import { FuelTank } from '../../entities/fuel-tank.entity'
import { FuelTankReading } from '../../entities/fuel-tank-reading.entity'
import { BranchType, UserRole } from '../../common/enums'
import { CreateFuelProductDto } from './dto/create-fuel-product.dto'
import { CreateFuelPumpDto } from './dto/create-fuel-pump.dto'
import { CreateFuelReconciliationDto } from './dto/create-fuel-reconciliation.dto'
import { CreateFuelExpenseDto } from './dto/create-fuel-expense.dto'
import { UpdateFuelReconciliationDto } from './dto/update-fuel-reconciliation.dto'
import { CreateFuelTankDto } from './dto/create-fuel-tank.dto'
import { UpdateFuelTankDto } from './dto/update-fuel-tank.dto'
import { CreateFuelTankReadingDto } from './dto/create-fuel-tank-reading.dto'

@Injectable()
export class FuelService {
  constructor(
    @InjectRepository(Branch) private branchesRepo: Repository<Branch>,
    @InjectRepository(FuelProduct) private productsRepo: Repository<FuelProduct>,
    @InjectRepository(FuelPump) private pumpsRepo: Repository<FuelPump>,
    @InjectRepository(ShiftReconciliation) private reconciliationsRepo: Repository<ShiftReconciliation>,
    @InjectRepository(FuelExpense) private expensesRepo: Repository<FuelExpense>,
    @InjectRepository(FuelTank) private tanksRepo: Repository<FuelTank>,
    @InjectRepository(FuelTankReading) private tankReadingsRepo: Repository<FuelTankReading>,
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

  async createTank(current: any, dto: CreateFuelTankDto) {
    this.ensureTankManagerAccess(current)
    const branch = await this.ensureBranch(dto.branch_id, current)
    const tank = this.tanksRepo.create({
      branch,
      name: dto.name.trim(),
      product_type: dto.product_type,
      capacity_litres: dto.capacity_litres,
      current_volume_litres: dto.current_volume_litres ?? 0,
      status: dto.status?.trim() || 'active',
    })
    return this.tanksRepo.save(tank)
  }

  async listTanks(current: any, branchId: string) {
    this.ensureTankManagerAccess(current)
    await this.ensureBranch(branchId, current)
    return this.tanksRepo.find({
      where: { branch: { id: branchId } },
      relations: ['branch'],
      order: { created_at: 'ASC' },
    })
  }

  async updateTank(current: any, id: string, dto: UpdateFuelTankDto) {
    this.ensureTankManagerAccess(current)
    const tank = await this.ensureTank(id, current)
    if (dto.name !== undefined) tank.name = dto.name.trim()
    if (dto.product_type !== undefined) tank.product_type = dto.product_type
    if (dto.capacity_litres !== undefined) tank.capacity_litres = dto.capacity_litres
    if (dto.current_volume_litres !== undefined) tank.current_volume_litres = dto.current_volume_litres
    if (dto.status !== undefined) tank.status = dto.status.trim() || tank.status
    return this.tanksRepo.save(tank)
  }

  async createTankReading(current: any, dto: CreateFuelTankReadingDto) {
    this.ensureTankManagerAccess(current)
    const tank = await this.ensureTank(dto.tank_id, current)
    const opening = Number(dto.opening_volume_litres ?? 0)
    const deliveries = Number(dto.deliveries_litres ?? 0)
    const transfersOut = Number(dto.transfers_out_litres ?? 0)
    const sales = Number(dto.sales_litres ?? 0)
    const actualClosing = Number(dto.actual_closing_litres ?? 0)
    const expectedClosing = opening + deliveries - sales - transfersOut
    const variance = actualClosing - expectedClosing

    const existing = await this.tankReadingsRepo.findOne({
      where: { tank: { id: tank.id }, reading_date: dto.reading_date },
      relations: ['tank', 'tank.branch', 'tank.branch.tenant'],
    })
    if (existing) {
      throw new BadRequestException('A tank reading already exists for this date')
    }

    const reading = this.tankReadingsRepo.create({
      tank,
      reading_date: dto.reading_date,
      opening_volume_litres: opening,
      deliveries_litres: deliveries,
      transfers_out_litres: transfersOut,
      sales_litres: sales,
      expected_closing_litres: expectedClosing,
      actual_closing_litres: actualClosing,
      variance_litres: variance,
      dip_reading_litres: dto.dip_reading_litres ?? null,
      sensor_volume_litres: dto.sensor_volume_litres ?? null,
      recorded_by_name: String(current?.name ?? '').trim() || null,
      notes: dto.notes?.trim() ?? '',
    })

    const saved = await this.tankReadingsRepo.save(reading)
    tank.current_volume_litres = actualClosing
    await this.tanksRepo.save(tank)
    return saved
  }

  async listTankReadingsByBranch(current: any, branchId: string) {
    this.ensureTankManagerAccess(current)
    await this.ensureBranch(branchId, current)
    return this.tankReadingsRepo.find({
      where: { tank: { branch: { id: branchId } } },
      relations: ['tank', 'tank.branch'],
      order: { reading_date: 'DESC', created_at: 'DESC' },
    })
  }

  async createReconciliation(current: any, dto: CreateFuelReconciliationDto) {
    const branch = await this.ensureBranch(dto.branch_id, current)
    const pumpId = String(dto.pump_id ?? '').trim()
    if (!pumpId) {
      throw new BadRequestException('pump_id is required')
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(pumpId)) {
      throw new BadRequestException('Invalid pump_id format')
    }
    const pump = await this.pumpsRepo.findOne({ where: { id: pumpId, branch: { id: branch.id } } })
    if (!pump) {
      throw new BadRequestException('Pump not found for this branch')
    }
    const reconciliation = this.reconciliationsRepo.create({
      branch,
      pump,
      shift_number: dto.shift_number,
      start_reading: dto.start_reading,
      end_reading: dto.end_reading,
      sales_amount: dto.sales_amount,
      variance: dto.variance,
      sales_staff_name:
        String(dto.sales_staff_name ?? '').trim() ||
        String(current?.name ?? '').trim() ||
        'Unassigned',
      created_by_user_id: String(current?.id ?? current?.user_id ?? '').trim() || null,
      created_by_role: String(current?.role ?? '').trim() || null,
      ...(dto.created_at && { created_at: new Date(dto.created_at) }),
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

  async listMyReconciliations(current: any, branchId: string) {
    await this.ensureBranch(branchId, current)
    const currentUserId = String(current?.id ?? current?.user_id ?? '').trim()
    
    console.log('=== listMyReconciliations DEBUG ===')
    console.log('Current user ID:', currentUserId)
    console.log('Branch ID:', branchId)
    console.log('Current user role:', current?.role)
    
    if (!currentUserId) {
      console.log('No current user ID found, returning empty array')
      return []
    }
    
    // Strict filter: only return shifts where created_by_user_id matches exactly
    const reconciliations = await this.reconciliationsRepo.find({
      where: { 
        branch: { id: branchId }, 
        created_by_user_id: currentUserId 
      },
      relations: ['pump', 'branch'],
    })
    
    console.log('Found reconciliations with matching user ID:', reconciliations.length)
    
    // Additional filter to ensure no null or mismatched IDs slip through
    const filtered = reconciliations.filter(rec => 
      rec.created_by_user_id && rec.created_by_user_id === currentUserId
    )
    
    console.log('Filtered reconciliations:', filtered.length)
    return filtered
  }

  async updateReconciliation(current: any, id: string, dto: UpdateFuelReconciliationDto) {
    const reconciliation = await this.ensureReconciliation(id, current)
    const currentUserId = String(current?.id ?? current?.user_id ?? '').trim()
    const currentUserName = String(current?.name ?? '').trim().toLowerCase()
    const branchManagerId = String(reconciliation.branch?.manager?.id ?? '').trim()
    const branchManagerName = String(reconciliation.branch?.manager_name ?? '').trim().toLowerCase()
    const isBranchManager =
      Boolean(currentUserId && branchManagerId && currentUserId === branchManagerId) ||
      Boolean(currentUserName && branchManagerName && currentUserName === branchManagerName)
    const currentRole = String(current?.role ?? '').trim() as UserRole
    if (currentRole === UserRole.SALES_STAFF && !isBranchManager) {
      const createdByUserId = String(reconciliation.created_by_user_id ?? '').trim()
      if (!createdByUserId || !currentUserId || createdByUserId !== currentUserId) {
        throw new ForbiddenException('You can only edit your own shift reconciliations')
      }
    }
    const branch = dto.branch_id ? await this.ensureBranch(dto.branch_id, current) : reconciliation.branch

    let pump = reconciliation.pump ?? null
    if (dto.pump_id !== undefined) {
      const pumpId = String(dto.pump_id ?? '').trim()
      if (!pumpId) {
        throw new BadRequestException('pump_id is required')
      }
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(pumpId)) {
        throw new BadRequestException('Invalid pump_id format')
      }
      const foundPump = await this.pumpsRepo.findOne({ where: { id: pumpId, branch: { id: branch.id } } })
      if (!foundPump) {
        throw new BadRequestException('Pump not found for this branch')
      }
      pump = foundPump
    }

    if (dto.end_reading !== undefined && dto.start_reading !== undefined && dto.end_reading < dto.start_reading) {
      throw new BadRequestException('End reading cannot be less than start reading')
    }
    if (dto.end_reading !== undefined && dto.start_reading === undefined && dto.end_reading < Number(reconciliation.start_reading)) {
      throw new BadRequestException('End reading cannot be less than start reading')
    }
    if (dto.start_reading !== undefined && dto.end_reading === undefined && Number(reconciliation.end_reading) < dto.start_reading) {
      throw new BadRequestException('End reading cannot be less than start reading')
    }

    reconciliation.branch = branch
    reconciliation.pump = pump
    if (dto.shift_number !== undefined) reconciliation.shift_number = dto.shift_number
    if (dto.start_reading !== undefined) reconciliation.start_reading = dto.start_reading
    if (dto.end_reading !== undefined) reconciliation.end_reading = dto.end_reading
    if (dto.sales_amount !== undefined) reconciliation.sales_amount = dto.sales_amount
    if (dto.variance !== undefined) reconciliation.variance = dto.variance
    if (dto.sales_staff_name !== undefined) {
      reconciliation.sales_staff_name = String(dto.sales_staff_name).trim() || 'Unassigned'
    }

    return this.reconciliationsRepo.save(reconciliation)
  }

  async deleteReconciliation(current: any, id: string) {
    const reconciliation = await this.ensureReconciliation(id, current)
    const currentUserId = String(current?.id ?? current?.user_id ?? '').trim()
    const currentUserName = String(current?.name ?? '').trim().toLowerCase()
    const branchManagerId = String(reconciliation.branch?.manager?.id ?? '').trim()
    const branchManagerName = String(reconciliation.branch?.manager_name ?? '').trim().toLowerCase()
    const isBranchManager =
      Boolean(currentUserId && branchManagerId && currentUserId === branchManagerId) ||
      Boolean(currentUserName && branchManagerName && currentUserName === branchManagerName)
    const currentRole = String(current?.role ?? '').trim() as UserRole
    if (currentRole === UserRole.SALES_STAFF && !isBranchManager) {
      throw new ForbiddenException('Sales staff cannot delete shift reconciliations')
    }
    await this.reconciliationsRepo.remove(reconciliation)
    return { success: true }
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

  async updateExpense(current: any, id: string, dto: CreateFuelExpenseDto) {
    const expense = await this.ensureExpense(id, current)
    if (dto.category !== undefined) expense.category = dto.category
    if (dto.amount !== undefined) expense.amount = dto.amount
    if (dto.description !== undefined) expense.description = dto.description
    return this.expensesRepo.save(expense)
  }

  async deleteExpense(current: any, id: string) {
    const expense = await this.ensureExpense(id, current)
    await this.expensesRepo.remove(expense)
    return { success: true }
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

  async debugReconciliations(current: any) {
    const reconciliations = await this.reconciliationsRepo
      .createQueryBuilder('rec')
      .leftJoinAndSelect('rec.branch', 'branch')
      .leftJoinAndSelect('rec.pump', 'pump')
      .where('branch.tenant_id = :tenantId', { tenantId: current.tenant_id })
      .orderBy('rec.created_at', 'DESC')
      .limit(50)
      .getMany()

    return reconciliations.map(rec => ({
      id: rec.id,
      branch_name: rec.branch?.name,
      sales_staff_name: rec.sales_staff_name,
      created_by_user_id: rec.created_by_user_id,
      created_by_role: rec.created_by_role,
      sales_amount: rec.sales_amount,
      created_at: rec.created_at,
      current_user_id: String(current?.id ?? current?.user_id ?? '').trim(),
      current_user_role: current?.role,
    }))
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

  private async ensureReconciliation(id: string, current: any) {
    const reconciliation = await this.reconciliationsRepo.findOne({
      where: { id },
      relations: ['branch', 'branch.tenant', 'branch.manager', 'pump'],
    })
    if (!reconciliation) {
      throw new NotFoundException('Shift reconciliation not found')
    }
    if (current.role !== UserRole.SUPER_ADMIN && reconciliation.branch?.tenant?.id !== current.tenant_id) {
      throw new BadRequestException('Unauthorized reconciliation access')
    }
    return reconciliation
  }

  private async ensureExpense(id: string, current: any) {
    const expense = await this.expensesRepo.findOne({
      where: { id },
      relations: ['branch', 'branch.tenant'],
    })
    if (!expense) {
      throw new NotFoundException('Expense not found')
    }
    if (current.role !== UserRole.SUPER_ADMIN && expense.branch?.tenant?.id !== current.tenant_id) {
      throw new BadRequestException('Unauthorized expense access')
    }
    return expense
  }

  private ensureTankManagerAccess(current: any) {
    const role = String(current?.role ?? '').trim() as UserRole
    if (
      role !== UserRole.SUPER_ADMIN &&
      role !== UserRole.ORG_OWNER &&
      role !== UserRole.FUEL_MANAGER
    ) {
      throw new ForbiddenException('Tank storage management is restricted to owners and fuel managers')
    }
  }

  private async ensureTank(id: string, current: any) {
    const tank = await this.tanksRepo.findOne({
      where: { id },
      relations: ['branch', 'branch.tenant'],
    })
    if (!tank) {
      throw new NotFoundException('Fuel tank not found')
    }
    if (current.role !== UserRole.SUPER_ADMIN && tank.branch?.tenant?.id !== current.tenant_id) {
      throw new BadRequestException('Unauthorized tank access')
    }
    return tank
  }
}
