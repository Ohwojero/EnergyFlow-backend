import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Branch } from '../../entities/branch.entity'
import { GasCylinder } from '../../entities/gas-cylinder.entity'
import { GasTransaction, GasTransactionType } from '../../entities/gas-transaction.entity'
import { GasExpense } from '../../entities/gas-expense.entity'
import { BranchType, TenantPlan, UserRole } from '../../common/enums'
import { Tenant } from '../../entities/tenant.entity'
import { CreateGasCylinderDto } from './dto/create-gas-cylinder.dto'
import { CreateGasTransactionDto } from './dto/create-gas-transaction.dto'
import { CreateGasExpenseDto } from './dto/create-gas-expense.dto'
import { UpdateGasTransactionDto } from './dto/update-gas-transaction.dto'

@Injectable()
export class GasService {
  constructor(
    @InjectRepository(Branch) private branchesRepo: Repository<Branch>,
    @InjectRepository(Tenant) private tenantsRepo: Repository<Tenant>,
    @InjectRepository(GasCylinder) private cylindersRepo: Repository<GasCylinder>,
    @InjectRepository(GasTransaction) private transactionsRepo: Repository<GasTransaction>,
    @InjectRepository(GasExpense) private expensesRepo: Repository<GasExpense>,
  ) {}

  async getBranches(current: { role: UserRole; tenant_id?: string }) {
    if (current.role === UserRole.SUPER_ADMIN) {
      return this.branchesRepo.find({ where: { type: BranchType.GAS } })
    }
    if (!current.tenant_id) return []
    await this.ensurePersonalDefaultGasBranch(current.tenant_id)
    return this.branchesRepo.find({
      where: { type: BranchType.GAS, tenant: { id: current.tenant_id } },
    })
  }

  async createCylinder(current: any, dto: CreateGasCylinderDto) {
    const branch = await this.ensureBranch(dto.branch_id, current)
    const cylinder = this.cylindersRepo.create({
      branch,
      size: dto.size,
      status: dto.status,
      quantity: dto.quantity,
      purchase_price: dto.purchase_price,
      selling_price: dto.selling_price,
    })
    try {
      return await this.cylindersRepo.save(cylinder)
    } catch (error: any) {
      const message = String(error?.message ?? '')
      if (message.includes('invalid input value for enum') && message.includes('gas_cylinders_size_enum')) {
        throw new BadRequestException(
          'Tank size schema is outdated. Run migration 1773000000000 to allow custom tank sizes.',
        )
      }
      throw error
    }
  }

  async listCylinders(current: any, branchId: string) {
    await this.ensureBranch(branchId, current)
    return this.cylindersRepo.find({
      where: { branch: { id: branchId } },
      relations: ['branch'],
    })
  }

  async createTransaction(current: any, dto: CreateGasTransactionDto) {
    const branch = await this.ensureBranch(dto.branch_id, current)
    const tx = this.transactionsRepo.create({
      branch,
      type: dto.type,
      cylinder_size: dto.cylinder_size,
      quantity: dto.quantity,
      amount: dto.amount,
      notes: dto.notes ?? '',
      created_by_user_id: String(current?.id ?? current?.user_id ?? '').trim() || null,
      created_by_role: String(current?.role ?? '').trim() || null,
      ...(dto.created_at && { created_at: new Date(dto.created_at) }),
    })
    return this.transactionsRepo.save(tx)
  }

  async listSales(current: any, branchId: string) {
    await this.ensureBranch(branchId, current)
    return this.transactionsRepo.find({
      where: { branch: { id: branchId }, type: GasTransactionType.SALE },
      relations: ['branch'],
    })
  }

  async listMySales(current: any, branchId: string) {
    await this.ensureBranch(branchId, current)
    const currentUserId = String(current?.id ?? current?.user_id ?? '').trim()
    
    if (!currentUserId) {
      return []
    }
    
    // Only return sales where created_by_user_id matches exactly
    const sales = await this.transactionsRepo.find({
      where: { 
        branch: { id: branchId }, 
        type: GasTransactionType.SALE,
        created_by_user_id: currentUserId 
      },
      relations: ['branch'],
    })
    
    // Additional filter to ensure no null or mismatched IDs slip through
    const filtered = sales.filter(sale => 
      sale.created_by_user_id && sale.created_by_user_id === currentUserId
    )
    
    return filtered
  }

  async updateSale(current: any, id: string, dto: UpdateGasTransactionDto) {
    const tx = await this.transactionsRepo.findOne({
      where: { id, type: GasTransactionType.SALE },
      relations: ['branch', 'branch.tenant'],
    })
    if (!tx) {
      throw new NotFoundException('Sale transaction not found')
    }
    this.ensureBranchAccess(tx.branch, current)

    if (dto.quantity !== undefined) tx.quantity = dto.quantity
    if (dto.amount !== undefined) tx.amount = dto.amount
    if (dto.notes !== undefined) tx.notes = dto.notes
    if (dto.cylinder_size !== undefined) tx.cylinder_size = dto.cylinder_size

    return this.transactionsRepo.save(tx)
  }

  async deleteSale(current: any, id: string) {
    const tx = await this.transactionsRepo.findOne({
      where: { id, type: GasTransactionType.SALE },
      relations: ['branch', 'branch.tenant'],
    })
    if (!tx) {
      throw new NotFoundException('Sale transaction not found')
    }
    this.ensureBranchAccess(tx.branch, current)
    await this.transactionsRepo.remove(tx)
    return { success: true }
  }

  async createExpense(current: any, dto: CreateGasExpenseDto) {
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

  async updateExpense(current: any, id: string, dto: Partial<CreateGasExpenseDto>) {
    const expense = await this.expensesRepo.findOne({
      where: { id },
      relations: ['branch', 'branch.tenant'],
    })
    if (!expense) {
      throw new NotFoundException('Gas expense not found')
    }
    this.ensureBranchAccess(expense.branch, current)

    if (dto.category !== undefined) expense.category = dto.category
    if (dto.amount !== undefined) expense.amount = dto.amount
    if (dto.description !== undefined) expense.description = dto.description

    return this.expensesRepo.save(expense)
  }

  async deleteExpense(current: any, id: string) {
    const expense = await this.expensesRepo.findOne({
      where: { id },
      relations: ['branch', 'branch.tenant'],
    })
    if (!expense) {
      throw new NotFoundException('Gas expense not found')
    }
    this.ensureBranchAccess(expense.branch, current)
    await this.expensesRepo.remove(expense)
    return { success: true }
  }

  async analytics(current: any, branchId: string) {
    await this.ensureBranch(branchId, current)
    const sales = await this.transactionsRepo
      .createQueryBuilder('tx')
      .select('COALESCE(SUM(tx.amount), 0)', 'total')
      .where('tx.branchId = :branchId', { branchId })
      .andWhere('tx.type = :type', { type: GasTransactionType.SALE })
      .getRawOne()

    const expenses = await this.expensesRepo
      .createQueryBuilder('ex')
      .select('COALESCE(SUM(ex.amount), 0)', 'total')
      .where('ex.branchId = :branchId', { branchId })
      .getRawOne()

    const inventory = await this.cylindersRepo
      .createQueryBuilder('cyl')
      .select('COALESCE(SUM(cyl.quantity * cyl.selling_price), 0)', 'total')
      .where('cyl.branchId = :branchId', { branchId })
      .getRawOne()

    return {
      total_sales: Number(sales.total ?? 0),
      total_expenses: Number(expenses.total ?? 0),
      inventory_value: Number(inventory.total ?? 0),
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
    if (branch.type !== BranchType.GAS) {
      throw new BadRequestException('Branch is not gas type')
    }
    return branch
  }

  private ensureBranchAccess(branch: Branch, current: any) {
    if (current.role !== UserRole.SUPER_ADMIN && branch.tenant?.id !== current.tenant_id) {
      throw new BadRequestException('Unauthorized branch access')
    }
    if (branch.type !== BranchType.GAS) {
      throw new BadRequestException('Branch is not gas type')
    }
  }

  private async ensurePersonalDefaultGasBranch(tenantId: string) {
    const tenant = await this.tenantsRepo.findOne({ where: { id: tenantId } })
    if (!tenant || tenant.subscription_plan !== TenantPlan.PERSONAL) {
      return
    }

    const existingGas = await this.branchesRepo.findOne({
      where: { tenant: { id: tenantId }, type: BranchType.GAS },
    })
    if (existingGas) {
      if (!(tenant.branch_types ?? []).includes(BranchType.GAS)) {
        tenant.branch_types = [...(tenant.branch_types ?? []), BranchType.GAS]
        await this.tenantsRepo.save(tenant)
      }
      return
    }

    const branch = this.branchesRepo.create({
      name: 'Main Outlet',
      type: BranchType.GAS,
      location: 'Default',
      tenant,
      manager: null,
      status: 'active',
    })
    await this.branchesRepo.save(branch)

    if (!(tenant.branch_types ?? []).includes(BranchType.GAS)) {
      tenant.branch_types = [...(tenant.branch_types ?? []), BranchType.GAS]
      await this.tenantsRepo.save(tenant)
    }
  }
}
